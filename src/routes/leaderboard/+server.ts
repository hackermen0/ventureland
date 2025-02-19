import { connectToDatabase } from "$lib/db";
import type { ChangeStream, ChangeStreamDocument, WithId } from "mongodb";

type LeaderboardEntry = {
    _id: string;
    name: string;
    points: number;
};

export async function GET({ setHeaders }) {
    const db = await connectToDatabase();
    const collection = db.collection<LeaderboardEntry>("Leaderboard");

    const changeStream: ChangeStream<WithId<LeaderboardEntry>> = collection.watch([], { fullDocument: "updateLookup" });

    setHeaders({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
    });

    return new Response(
        new ReadableStream({
            start(controller) {
                let isClosed = false; // Track stream state

                const sendData = (change: ChangeStreamDocument<WithId<LeaderboardEntry>>) => {
                    if (isClosed) return; // Prevent writing to closed stream

                    if (change.operationType === "insert" || change.operationType === "update") {
                        const updatedDocument = change.fullDocument;
                        if (updatedDocument) {
                            controller.enqueue(`data: ${JSON.stringify(updatedDocument)}\n\n`);
                        }
                    }
                };

                changeStream.on("change", sendData);

                changeStream.on("error", (err) => {
                    console.error("Change Stream Error:", err);
                    if (!isClosed) {
                        isClosed = true;
                        controller.close();
                        changeStream.close().catch(console.error);
                    }
                });

                // Override close to ensure proper cleanup
                const originalClose = controller.close.bind(controller);
                controller.close = () => {
                    if (!isClosed) {
                        isClosed = true;
                        changeStream.off("change", sendData);
                        changeStream.close().catch(console.error);
                        originalClose();
                    }
                };
            },
        })
    );
}

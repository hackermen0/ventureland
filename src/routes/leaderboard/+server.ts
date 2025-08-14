import { connectToDatabase } from "$lib/db";
import type { ChangeStream, ChangeStreamDocument, WithId } from "mongodb";
import type { User } from "../../types/User.js";


export async function GET({ setHeaders }) {
    const db = await connectToDatabase();
    const collection = db.collection<User>("Leaderboard");

    const changeStream: ChangeStream<WithId<User>> = collection.watch([], { fullDocument: "updateLookup" });

    setHeaders({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
    });

    return new Response(
        new ReadableStream({
            start(controller) {
                let isClosed = false;

                const sendData = (change: ChangeStreamDocument<WithId<User>>) => {
                    if (isClosed) return;

                    if (change.operationType === "insert" || change.operationType === "update") {
                        const updatedDocument = change.fullDocument;
                        console.log(`LEADERBOARD_ENTRY CREATION ID: ${updatedDocument?._id}`)

                        if (updatedDocument) {
                            controller.enqueue("event: update\n")
                            controller.enqueue(`data: ${JSON.stringify(updatedDocument)}\n\n`);
                        }
                    }
                    else if(change.operationType == "delete") {
                        const deletedDocument = change.documentKey;
                        console.log(`LEADERBOARD_ENTRY DELETION ID: ${deletedDocument._id}`)

                        if(deletedDocument) {
                            controller.enqueue("event: delete\n")
                            controller.enqueue(`data: ${JSON.stringify(deletedDocument)}\n\n`)
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

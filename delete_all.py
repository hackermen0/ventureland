import dotenv
import os
import pymongo

dotenv.load_dotenv()

MONGO_URI = os.getenv("VITE_MONGO_URI")
cluster = pymongo.MongoClient(MONGO_URI)
db = cluster["E-Summit"]
collection = db["Leaderboard"]

collection.delete_many({})
print("Done")

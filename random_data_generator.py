import dotenv
import pymongo
from random import randint
import os
import uuid
import time


dotenv.load_dotenv()

names = """Gemma Lawrence
Kaleb Arnold
Finley Esquivel
Bridger Barnes
Liliana Cole
Nathaniel Duke
Melani Allen
Carter Wilkins
Amalia Hendrix
Korbyn Espinoza
Lucille Briggs
Case Ayers
Simone Frost
Dario Santiago
Nyla Moore
Levi Greene
Selena Moreno
Myles Phan
Elsa McCormick
Jasiah Hoffman
Aspen Cervantes
Kamari Marks
Monica Flores
Lincoln Cabrera
Daleyza Thomas
Logan Becker
Laura Holmes
King Ruiz
Emery Lang
Wells Rush
Maleah Foley
Mohammad Simpson
Anastasia Stafford
Alfredo Krueger
Kamari Bailey
Axel George
Adelyn Griffith
Franklin Anderson
Ella Singleton
Landyn Perkins
Sage Guerra
Leland Terry
Wren Macdonald
Hugh Roach
Lyanna Franklin
Simon Roman
Astrid Silva
Luka Gutierrez
Savannah Curtis
Muhammad Berg
Emmalyn Donaldson
Canaan Matthews
Lila Kemp
Melvin Edwards
Ivy Bowen
Trevor Herrera
Ximena Lowery
Jaxxon Suarez
Jimena Roman
Kian Patrick
Lyra Corona
Darian Robles
Felicity Duran
Ismael Ward
Ariana Durham
Kellen Gallagher
Elliott Esquivel
Bridger Escobar
Erin Andrade
Abdiel Andrade
Emmy Lynch
Zane Davidson
Jayla McKenzie
Scott Wheeler
Sydney Wyatt
Sam Beck
Gia Woodard
Westley Miller
Isabella Tucker
Ivan Bonilla
Romina Haynes
Kason Dougherty
Alisson Espinoza
Dallas Cardenas
Raven Swanson
Hugo Ho
Calliope Meyers
Julien Le
Myla Curry
Briggs Hubbard
Rosie Erickson
Johnny Harrington
Legacy Salgado
Trace Carr
Rowan Rubio
Titan Flynn
Dorothy Solis
Ronin Pearson
Kiara Escobar
Zachariah Jenkins"""

names = names.split("\n")

MONGO_URI = os.getenv("VITE_MONGO_URI")
cluster = pymongo.MongoClient(MONGO_URI)
db = cluster["E-Summit"]
collection = db["Leaderboard"]

for i in range(10):
    insert_dict = {
        "_id": str(uuid.uuid4()),
        "name": names[randint(0, len(names) - 1)],
        "points": randint(0, 100),
    }
    print(insert_dict)
    collection.insert_one(insert_dict)
    print("Data Inserted")
    time.sleep(3)

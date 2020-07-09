import json


def load_db():
    with open("flashcards_db.json",encoding="utf8") as f:
        return json.load(f)

db = load_db()

def save_db():
    with open("flashcards_db.json", encoding="utf8", mode="w") as f:
        return json.dump(db, f)
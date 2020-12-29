from simtool_engine.services import DataStore
from pprint import pprint

ds = DataStore()

#Create Philosopher Generators.
startA = {
    "name" : "Start A",
    "entity_name" : "Philosopher A",
    "generation" : {
        "init" : 1
    },
    "limit" : 1,
    "uid" : "sA"
}

startB = {
    "name" : "Start B",
    "entity_name" : "Philosopher B",
    "generation" : {
        "init" : 1
    },
    "limit" : 1,
    "uid" : "sB"
}

startC = {
    "name" : "Start C",
    "entity_name" : "Philosopher C",
    "generation" : {
        "init" : 1
    },
    "limit" : 1,
    "uid" : "sC"
}

startD = {
    "name" : "Start D",
    "entity_name" : "Philosopher D",
    "generation" : {
        "init" : 1
    },
    "limit" : 1,
    "uid" : "sD"
}

startE = {
    "name" : "Start E",
    "entity_name" : "Philosopher E",
    "generation" : {
        "init" : 1
    },
    "limit" : 1,
    "uid" : "sE"
}


ds.create_node(ds.START, startA)
ds.create_node(ds.START, startB)
ds.create_node(ds.START, startC)
ds.create_node(ds.START, startD)
ds.create_node(ds.START, startE)
ds.create_node(ds.END, {"name" : "Done", "uid" : "end"})

#Create Table.
ds.create_node(ds.STATION, {
    "name" : "table",
    "capacity" : 5,
    "interaction_time": {
        "time" : 0 #We want them to immediately try taking utensils.
    },
    "uid" : "table"
})

#Create Philosopher thinking stations.
ds.create_node(ds.STATION, {
    "name" : "Thinking A",
    "capacity" : 1,
    "interaction_time": {
        "dist" : "NORMAL",
        "loc" : 30, #Think on avg 30 seconds.
        "scale" : 4
    },
    "uid" : "thinkA"
})

ds.create_node(ds.STATION, {
    "name" : "Thinking B",
    "capacity" : 1,
    "interaction_time": {
        "dist" : "NORMAL",
        "loc" : 30, #Think on avg 30 seconds.
        "scale" : 4
    },
    "uid" : "thinkB"
})

ds.create_node(ds.STATION, {
    "name" : "Thinking C",
    "capacity" : 1,
    "interaction_time": {
        "dist" : "NORMAL",
        "loc" : 30, #Think on avg 30 seconds.
        "scale" : 4
    },
    "uid" : "thinkC"
})

ds.create_node(ds.STATION, {
    "name" : "Thinking D",
    "capacity" : 1,
    "interaction_time": {
        "dist" : "NORMAL",
        "loc" : 30, #Think on avg 30 seconds.
        "scale" : 4
    },
    "uid" : "thinkD"
})

ds.create_node(ds.STATION, {
    "name" : "Thinking E",
    "capacity" : 1,
    "interaction_time": {
        "dist" : "NORMAL",
        "loc" : 30, #Think on avg 30 seconds.
        "scale" : 4
    },
    "uid" : "thinkE"
})

#Create Philosopher Eating stations.
ds.create_node(ds.STATION, {
    "name" : "Eating A",
    "capacity" : 1,
    "interaction_time": {
        "dist" : "NORMAL",
        "loc" : 100, #Eat on avg 100 seconds.
        "scale" : 10
    },
    "uid" : "eatA"
})

ds.create_node(ds.STATION, {
    "name" : "Eating B",
    "capacity" : 1,
    "interaction_time": {
        "dist" : "NORMAL",
        "loc" : 100, #Eat on avg 100 seconds.
        "scale" : 10
    },
    "uid" : "eatB"
})

ds.create_node(ds.STATION, {
    "name" : "Eating C",
    "capacity" : 1,
    "interaction_time": {
        "dist" : "NORMAL",
        "loc" : 100, #Eat on avg 100 seconds.
        "scale" : 10
    },
    "uid" : "eatC"
})

ds.create_node(ds.STATION, {
    "name" : "Eating D",
    "capacity" : 1,
    "interaction_time": {
        "dist" : "NORMAL",
        "loc" : 100, #Eat on avg 100 seconds.
        "scale" : 10
    },
    "uid" : "eatD"
})

ds.create_node(ds.STATION, {
    "name" : "Eating E",
    "capacity" : 1,
    "interaction_time": {
        "dist" : "NORMAL",
        "loc" : 100, #Eat on avg 100 seconds.
        "scale" : 10
    },
    "uid" : "eatE"
})

#Create fork holders for table.
ds.create_container("table", {
    "name" : "Fork 1 Place",
    "resource" : "Fork 1",
    "init" : {"init" : 1},
    "capacity" : 1,
    "owner" : "table",
    "uid": "f1p"
})

ds.create_container("table", {
    "name" : "Fork 2 Place",
    "resource" : "Fork 2",
    "init" : {"init" : 1},
    "capacity" : 1,
    "owner" : "table",
    "uid": "f2p"
})

ds.create_container("table", {
    "name" : "Fork 3 Place",
    "resource" : "Fork 3",
    "init" : {"init" : 1},
    "capacity" : 1,
    "owner" : "table",
    "uid": "f3p"
})

ds.create_container("table", {
    "name" : "Fork 4 Place",
    "resource" : "Fork 4",
    "init" : {"init" : 1},
    "capacity" : 1,
    "owner" : "table",
    "uid": "f4p"
})

ds.create_container("table", {
    "name" : "Fork 5 Place",
    "resource" : "Fork 5",
    "init" : {"init" : 1},
    "capacity" : 1,
    "owner" : "table",
    "uid": "f5p"
})

#Create Philosopher hands.
ds.create_blueprint({
    "name" : "Philosopher A Left Hand",
    "resource" : "Fork 1",
    "init" : {"init" : 0},
    "capacity" : 1,
    "uid" : "pAlh"  
})

ds.create_blueprint({
    "name" : "Philosopher A Right Hand",
    "resource" : "Fork 2",
    "init" : {"init" : 0},
    "capacity" : 1,
    "uid" : "pArh"  
})

ds.add_blueprint("sA", "pAlh")
ds.add_blueprint("sA", "pArh")

ds.create_blueprint({
    "name" : "Philosopher B Left Hand",
    "resource" : "Fork 2",
    "init" : {"init" : 0},
    "capacity" : 1,
    "uid" : "pBlh"  
})

ds.create_blueprint({
    "name" : "Philosopher B Right Hand",
    "resource" : "Fork 3",
    "init" : {"init" : 0},
    "capacity" : 1,
    "uid" : "pBrh"  
})

ds.add_blueprint("sB", "pBlh")
ds.add_blueprint("sB", "pBrh")

ds.create_blueprint({
    "name" : "Philosopher C Left Hand",
    "resource" : "Fork 3",
    "init" : {"init" : 0},
    "capacity" : 1,
    "uid" : "pClh"  
})

ds.create_blueprint({
    "name" : "Philosopher C Right Hand",
    "resource" : "Fork 4",
    "init" : {"init" : 0},
    "capacity" : 1,
    "uid" : "pCrh"  
})

ds.add_blueprint("sC", "pClh")
ds.add_blueprint("sC", "pCrh")

ds.create_blueprint({
    "name" : "Philosopher D Left Hand",
    "resource" : "Fork 4",
    "init" : {"init" : 0},
    "capacity" : 1,
    "uid" : "pDlh"  
})

ds.create_blueprint({
    "name" : "Philosopher D Right Hand",
    "resource" : "Fork 5",
    "init" : {"init" : 0},
    "capacity" : 1,
    "uid" : "pDrh"  
})

ds.add_blueprint("sD", "pDlh")
ds.add_blueprint("sD", "pDrh")

ds.create_blueprint({
    "name" : "Philosopher E Left Hand",
    "resource" : "Fork 5",
    "init" : {"init" : 0},
    "capacity" : 1,
    "uid" : "pElh"  
})

ds.create_blueprint({
    "name" : "Philosopher E Right Hand",
    "resource" : "Fork 1",
    "init" : {"init" : 0},
    "capacity" : 1,
    "uid" : "pErh"  
})

ds.add_blueprint("sE", "pElh")
ds.add_blueprint("sE", "pErh")

#Create stomach blueprint
ds.create_blueprint({
    "name" : "Stomach",
    "resource": "Food",
    "init" : {"init" : 1},
    "capacity" : 10,
    "uid" : "stomach"
})

ds.add_blueprint("sA", "stomach")
ds.add_blueprint("sB", "stomach")
ds.add_blueprint("sC", "stomach")
ds.add_blueprint("sD", "stomach")
ds.add_blueprint("sE", "stomach")

#Direct everything

#Generator to think
ds.set_directed_to("sA", "thinkA")
ds.set_directed_to("sB", "thinkB")
ds.set_directed_to("sC", "thinkC")
ds.set_directed_to("sD", "thinkD")
ds.set_directed_to("sE", "thinkE")

#Think to table
ds.set_directed_to("thinkA", "table")
ds.set_directed_to("thinkB", "table")
ds.set_directed_to("thinkC", "table")
ds.set_directed_to("thinkD", "table")
ds.set_directed_to("thinkE", "table")

#Table to think
ds.set_directed_to("table", "thinkA")
ds.set_directed_to("table", "thinkB")
ds.set_directed_to("table", "thinkC")
ds.set_directed_to("table", "thinkD")
ds.set_directed_to("table", "thinkE")

#Table to eat
ds.set_directed_to("table", "eatA")
ds.set_directed_to("table", "eatB")
ds.set_directed_to("table", "eatC")
ds.set_directed_to("table", "eatD")
ds.set_directed_to("table", "eatE")

#Eat to table
ds.set_directed_to("eatA", "table")
ds.set_directed_to("eatB", "table")
ds.set_directed_to("eatC", "table")
ds.set_directed_to("eatD", "table")
ds.set_directed_to("eatE", "table")

#Table to done.
ds.set_directed_to("table", "end")

ds.create_logic("table", "BOOL")

#If Philosopher full, go to end.
ds.create_condition_group("table", "Philosopher Full", ["end"], [], True, False)
ds.add_condition("table", "Philosopher Full", {
    "name" : "Philospher Full",
    "con1_name" : "Stomach",
    "con2_name" : None,
    "mode" : "entity_value",
    "op" : "==",
    "val" : 10
})

#Philosopher A conditions and actions
ds.create_condition_group("table", "Philosopher A wants to Eat", ["eatA"],[], True, True)
ds.add_condition("table", "Philosopher A wants to Eat", {
    "name":  "Is Philosopher A",
    "con1_name" : None,
    "con2_name" : None,
    "mode" : "entity_name",
    "op" : "==",
    "val" : "Philosopher A 0"
})
ds.add_condition("table", "Philosopher A wants to Eat", {
    "name" : "Philosopher A Not Full",
    "con1_name" : "Stomach",
    "con2_name" : None,
    "mode" : "entity_value",
    "op" : "<",
    "val" : 10
})
ds.add_action("table", "Philosopher A wants to Eat", {
    "name" : "Grab Left Fork (1)",
    "con1_name" : "Philosopher A Left Hand",
    "con2_name" : "Fork 1 Place",
    "op" : "GIVE",
    "val" : 1
})
ds.add_action("table", "Philosopher A wants to Eat", {
    "name" : "Grab Right Fork (2)",
    "con1_name" : "Philosopher A Right Hand",
    "con2_name" : "Fork 2 Place",
    "op" : "GIVE",
    "val" : 1
})

ds.create_condition_group("table", "Philosopher A just Ate", ["thinkA"],[], True, False)
ds.add_condition("table", "Philosopher A just Ate", {
    "name":  "Is Philosopher A",
    "con1_name" : None,
    "con2_name" : None,
    "mode" : "entity_name",
    "op" : "==",
    "val" : "Philosopher A 0"
})
ds.add_condition("table", "Philosopher A just Ate", {
    "name":  "Has fork",
    "con1_name" : "Philosopher A Left Hand",
    "con2_name" : None,
    "mode" : "entity_value",
    "op" : "==",
    "val" : 1
})
ds.add_action("table", "Philosopher A just Ate", {
    "name" : "Return Left Fork (1)",
    "con1_name" : "Philosopher A Left Hand",
    "con2_name" : "Fork 1 Place",
    "op" : "TAKE",
    "val" : 1
})
ds.add_action("table", "Philosopher A just Ate", {
    "name" : "Return Right Fork (2)",
    "con1_name" : "Philosopher A Right Hand",
    "con2_name" : "Fork 2 Place",
    "op" : "TAKE",
    "val" : 1
})
ds.add_action("table", "Philosopher A just Ate", {
    "name" : "Give Food",
    "con1_name" : "Stomach",
    "con2_name" : None,
    "op" : "ADD",
    "val" : 1
})

#Philosopher B conditions and actions
ds.create_condition_group("table", "Philosopher B wants to Eat", ["eatB"],[], True, True)
ds.add_condition("table", "Philosopher B wants to Eat", {
    "name":  "Is Philosopher B",
    "con1_name" : None,
    "con2_name" : None,
    "mode" : "entity_name",
    "op" : "==",
    "val" : "Philosopher B 0"
})
ds.add_condition("table", "Philosopher B wants to Eat", {
    "name" : "Philosopher B Not Full",
    "con1_name" : "Stomach",
    "con2_name" : None,
    "mode" : "entity_value",
    "op" : "<",
    "val" : 10
})
ds.add_action("table", "Philosopher B wants to Eat", {
    "name" : "Grab Left Fork (2)",
    "con1_name" : "Philosopher B Left Hand",
    "con2_name" : "Fork 2 Place",
    "op" : "GIVE",
    "val" : 1
})
ds.add_action("table", "Philosopher B wants to Eat", {
    "name" : "Grab Right Fork (3)",
    "con1_name" : "Philosopher B Right Hand",
    "con2_name" : "Fork 3 Place",
    "op" : "GIVE",
    "val" : 1
})

ds.create_condition_group("table", "Philosopher B just Ate", ["thinkB"],[], True, False)
ds.add_condition("table", "Philosopher B just Ate", {
    "name":  "Is Philosopher B",
    "con1_name" : None,
    "con2_name" : None,
    "mode" : "entity_name",
    "op" : "==",
    "val" : "Philosopher B 0"
})
ds.add_condition("table", "Philosopher B just Ate", {
    "name":  "Has fork",
    "con1_name" : "Philosopher B Left Hand",
    "con2_name" : None,
    "mode" : "entity_value",
    "op" : "==",
    "val" : 1
})
ds.add_action("table", "Philosopher B just Ate", {
    "name" : "Return Left Fork (2)",
    "con1_name" : "Philosopher B Left Hand",
    "con2_name" : "Fork 2 Place",
    "op" : "TAKE",
    "val" : 1
})
ds.add_action("table", "Philosopher B just Ate", {
    "name" : "Return Right Fork (3)",
    "con1_name" : "Philosopher B Right Hand",
    "con2_name" : "Fork 3 Place",
    "op" : "TAKE",
    "val" : 1
})
ds.add_action("table", "Philosopher B just Ate", {
    "name" : "Give Food",
    "con1_name" : "Stomach",
    "con2_name" : None,
    "op" : "ADD",
    "val" : 1
})

#Philosopher C conditions and actions
ds.create_condition_group("table", "Philosopher C wants to Eat", ["eatC"],[], True, True)
ds.add_condition("table", "Philosopher C wants to Eat", {
    "name":  "Is Philosopher C",
    "con1_name" : None,
    "con2_name" : None,
    "mode" : "entity_name",
    "op" : "==",
    "val" : "Philosopher C 0"
})
ds.add_condition("table", "Philosopher C wants to Eat", {
    "name" : "Philosopher C Not Full",
    "con1_name" : "Stomach",
    "con2_name" : None,
    "mode" : "entity_value",
    "op" : "<",
    "val" : 10
})
ds.add_action("table", "Philosopher C wants to Eat", {
    "name" : "Grab Left Fork (3)",
    "con1_name" : "Philosopher C Left Hand",
    "con2_name" : "Fork 3 Place",
    "op" : "GIVE",
    "val" : 1
})
ds.add_action("table", "Philosopher C wants to Eat", {
    "name" : "Grab Right Fork (4)",
    "con1_name" : "Philosopher C Right Hand",
    "con2_name" : "Fork 4 Place",
    "op" : "GIVE",
    "val" : 1
})

ds.create_condition_group("table", "Philosopher C just Ate", ["thinkC"],[], True, False)
ds.add_condition("table", "Philosopher C just Ate", {
    "name":  "Is Philosopher C",
    "con1_name" : None,
    "con2_name" : None,
    "mode" : "entity_name",
    "op" : "==",
    "val" : "Philosopher C 0"
})
ds.add_condition("table", "Philosopher C just Ate", {
    "name":  "Has fork",
    "con1_name" : "Philosopher C Left Hand",
    "con2_name" : None,
    "mode" : "entity_value",
    "op" : "==",
    "val" : 1
})
ds.add_action("table", "Philosopher C just Ate", {
    "name" : "Return Left Fork (3)",
    "con1_name" : "Philosopher C Left Hand",
    "con2_name" : "Fork 3 Place",
    "op" : "TAKE",
    "val" : 1
})
ds.add_action("table", "Philosopher C just Ate", {
    "name" : "Return Right Fork (4)",
    "con1_name" : "Philosopher C Right Hand",
    "con2_name" : "Fork 4 Place",
    "op" : "TAKE",
    "val" : 1
})
ds.add_action("table", "Philosopher C just Ate", {
    "name" : "Give Food",
    "con1_name" : "Stomach",
    "con2_name" : None,
    "op" : "ADD",
    "val" : 1
})

#Philosopher D conditions and actions
ds.create_condition_group("table", "Philosopher D wants to Eat", ["eatB"],[], True, True)
ds.add_condition("table", "Philosopher D wants to Eat", {
    "name":  "Is Philosopher D",
    "con1_name" : None,
    "con2_name" : None,
    "mode" : "entity_name",
    "op" : "==",
    "val" : "Philosopher D 0"
})
ds.add_condition("table", "Philosopher D wants to Eat", {
    "name" : "Philosopher D Not Full",
    "con1_name" : "Stomach",
    "con2_name" : None,
    "mode" : "entity_value",
    "op" : "<",
    "val" : 10
})
ds.add_action("table", "Philosopher D wants to Eat", {
    "name" : "Grab Left Fork (4)",
    "con1_name" : "Philosopher D Left Hand",
    "con2_name" : "Fork 4 Place",
    "op" : "GIVE",
    "val" : 1
})
ds.add_action("table", "Philosopher D wants to Eat", {
    "name" : "Grab Right Fork (5)",
    "con1_name" : "Philosopher D Right Hand",
    "con2_name" : "Fork 5 Place",
    "op" : "GIVE",
    "val" : 1
})

ds.create_condition_group("table", "Philosopher D just Ate", ["thinkD"],[], True, False)
ds.add_condition("table", "Philosopher D just Ate", {
    "name":  "Is Philosopher D",
    "con1_name" : None,
    "con2_name" : None,
    "mode" : "entity_name",
    "op" : "==",
    "val" : "Philosopher D 0"
})
ds.add_condition("table", "Philosopher D just Ate", {
    "name":  "Has fork",
    "con1_name" : "Philosopher D Left Hand",
    "con2_name" : None,
    "mode" : "entity_value",
    "op" : "==",
    "val" : 1
})
ds.add_action("table", "Philosopher D just Ate", {
    "name" : "Return Left Fork (4)",
    "con1_name" : "Philosopher D Left Hand",
    "con2_name" : "Fork 4 Place",
    "op" : "TAKE",
    "val" : 1
})
ds.add_action("table", "Philosopher D just Ate", {
    "name" : "Return Right Fork (5)",
    "con1_name" : "Philosopher D Right Hand",
    "con2_name" : "Fork 5 Place",
    "op" : "TAKE",
    "val" : 1
})
ds.add_action("table", "Philosopher D just Ate", {
    "name" : "Give Food",
    "con1_name" : "Stomach",
    "con2_name" : None,
    "op" : "ADD",
    "val" : 1
})

#Philosopher E conditions and actions
ds.create_condition_group("table", "Philosopher E wants to Eat", ["eatE"],[], True, True)
ds.add_condition("table", "Philosopher E wants to Eat", {
    "name":  "Is Philosopher E",
    "con1_name" : None,
    "con2_name" : None,
    "mode" : "entity_name",
    "op" : "==",
    "val" : "Philosopher E 0"
})
ds.add_condition("table", "Philosopher E wants to Eat", {
    "name" : "Philosopher E Not Full",
    "con1_name" : "Stomach",
    "con2_name" : None,
    "mode" : "entity_value",
    "op" : "<",
    "val" : 10
})
ds.add_action("table", "Philosopher E wants to Eat", {
    "name" : "Grab Left Fork (5)",
    "con1_name" : "Philosopher E Left Hand",
    "con2_name" : "Fork 5 Place",
    "op" : "GIVE",
    "val" : 1
})
ds.add_action("table", "Philosopher E wants to Eat", {
    "name" : "Grab Right Fork (1)",
    "con1_name" : "Philosopher E Right Hand",
    "con2_name" : "Fork 1 Place",
    "op" : "GIVE",
    "val" : 1
})

ds.create_condition_group("table", "Philosopher E just Ate", ["thinkE"],[], True, False)
ds.add_condition("table", "Philosopher E just Ate", {
    "name":  "Is Philosopher E",
    "con1_name" : None,
    "con2_name" : None,
    "mode" : "entity_name",
    "op" : "==",
    "val" : "Philosopher E 0"
})
ds.add_condition("table", "Philosopher E just Ate", {
    "name":  "Has fork",
    "con1_name" : "Philosopher E Left Hand",
    "con2_name" : None,
    "mode" : "entity_value",
    "op" : "==",
    "val" : 1
})
ds.add_action("table", "Philosopher E just Ate", {
    "name" : "Return Left Fork (5)",
    "con1_name" : "Philosopher E Left Hand",
    "con2_name" : "Fork 5 Place",
    "op" : "TAKE",
    "val" : 1
})
ds.add_action("table", "Philosopher E just Ate", {
    "name" : "Return Right Fork (1)",
    "con1_name" : "Philosopher E Right Hand",
    "con2_name" : "Fork 1 Place",
    "op" : "TAKE",
    "val" : 1
})
ds.add_action("table", "Philosopher E just Ate", {
    "name" : "Give Food",
    "con1_name" : "Stomach",
    "con2_name" : None,
    "op" : "ADD",
    "val" : 1
})

ds.run(1000)
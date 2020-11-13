from simtool_engine.services import DataStore
from pprint import pprint

ds = DataStore()

ds.create_node(DataStore.START, {
    "name" : "Start A",
    "entity_name" : "A Person",
    "generation" : {
        "init" : 1
    },
    "limit" : 1,
    "uid" : "s1"
})

ds.create_node(DataStore.START, {
    "name" : "Start B",
    "entity_name" : "B Person",
    "generation" : {
        "init" : 1
    },
    "limit" : 1,
    "uid" : "s2"
})

ds.create_blueprint({
    "name" : "Wallet",
    "resource" : "Dollars",
    "init" : {
        "init" : 5
    },
    "capacity" : 5,
    "uid" : "wspec"
})

ds.add_blueprint("s1", "wspec")
ds.add_blueprint("s2", "wspec")

ds.create_blueprint({
    "name" : "Tickets",
    "resource" : "Ticket",
    "init" : {
        "init" : 0
    },
    "capacity" : 1,
    "uid" : "tspec"
})

ds.add_blueprint("s1", "tspec")
ds.add_blueprint("s2", "tspec")

ds.create_node(DataStore.STATION, {
    "name" : "Ticket Booth",
    "capacity": 2,
    "time_func": 10,
    "uid": "tb"
})

ds.set_directed_to("s1", "tb")
ds.set_directed_to("s2", "tb")

ds.create_container("tb", {
    'name'     : 'Tickets',
    'resource' : 'Ticket',
    'init'     : {
        'init' : 1
    },
    'capacity' : 1,
    'uid'      :  'tb_tickets',
    "owner": "tb"
})

ds.create_container("tb", {
    'name'     : 'Revenue',
    'resource' : 'Dollars',
    'init'     : {
        'init' : 0
    },
    'capacity' : "inf",
    'uid'      :  'person_tickets_bp',
    "owner": "tb"
})

ds.create_node(DataStore.END, {
    "name" : "Got Ticket",
    "uid" : "bought"
})

ds.create_node(DataStore.END, {
    "name" : "Missed Ticket",
    "uid" : "missed"
})

ds.set_directed_to("tb", "bought")
ds.set_directed_to("tb", "missed")

ds.create_logic("tb", "BOOL")

ds.create_condition_group('tb', "Conditions", ["bought"],["missed"])
ds.add_condition("tb", "Conditions", {
    "name" : "Have Enough Money",
    "con1_name" : "Wallet",
    "con2_name" : "Revenue",
    "mode" : "entity_value", 
    "op" : ">=",
    "val" : 5
})

ds.add_condition("tb", "Conditions", {
    "name" : "Tickets left",
    "con1_name" : None,
    "con2_name" : "Tickets",
    "mode" : "node_value", 
    "op" : ">=",
    "val" : 1
})

ds.create_action_group("tb", "Conditions")

ds.add_action("tb", "Conditions", {
    "name" : "Take money",
    "con1_name" : "Wallet",
    "con2_name" : "Revenue",
    "op" : "TAKE",
    "val" : 5
})

ds.add_action("tb", "Conditions", {
    "name" : "Give Ticket",
    "con1_name" : "Tickets",
    "con2_name" : "Tickets",
    "op" : "GIVE",
    "val" : 1
})

(log, summary) = ds.run(100)
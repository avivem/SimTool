from simtool_engine.services import DataStore
from pprint import pprint

ds = DataStore()

#Starting Point generation settings
rich_gen = {
    'dist'  : 'NORMAL',
    'loc'   : 20,
    'scale' : 2
}

poor_gen = {
    'dist'  : 'NORMAL',
    'loc'   : 5,
    'scale' : .8
}

#Settings for Starting Nodes.
rich_inputs = {
    "name" : "Rich Start",
    "entity_name" : "Rich Person",
    "generation" : rich_gen,
    "limit" : 300,
    "uid" : "rich_hotel"
}

poor_inputs = {
    "name" : "Poor Start",
    "entity_name" : "Poor Person",
    "generation" : poor_gen,
    "limit" : 2000,
    "uid" : "poor_hotel"
}

#Create Rich and Poor Hotel
ds.create_node(DataStore.START, rich_inputs)
ds.create_node(DataStore.START, poor_inputs)

#Settings for Rich Wallet Blueprint
rich_wallet_dict = {
    "name"     : "Wallet",
    "resource" : "Dollar",
    "init"     : {
        "dist"     : "NORMAL",
        "loc"      : 25,
        "scale"    : 5
    },
    "capacity" : 200,
    "uid"      : "rich_wallet_bp"
}

#Create and assign rich wallet blueprint to rich hotel
ds.create_blueprint(rich_wallet_dict)
ds.add_blueprint("rich_hotel", "rich_wallet_bp")

#Same as above for poor.
poor_wallet_dict = {
    'name'     : 'Wallet',
    'resource' : 'Dollar',
    'init'     : {
        'dist'     : 'NORMAL',
        'loc'      : 10,
        'scale'    : 4
    },
    'capacity' : 100,
    'uid'      : 'poor_wallet_bp'
}

ds.create_blueprint(poor_wallet_dict)
ds.add_blueprint("poor_hotel", "poor_wallet_bp")

#Create Ticket holder for both

tickets = {
    'name'     : 'Tickets',
    'resource' : 'Ticket',
    'init'     : {
        'init' : 0
    },
    'capacity' : 1,
    'uid'      :  'person_tickets_bp'
}
ds.create_blueprint(tickets)
ds.add_blueprint("rich_hotel", "person_tickets_bp")
ds.add_blueprint("poor_hotel", "person_tickets_bp")

#Use ALPHA_SEQ path choosing for starting nodes.

ds.create_logic('rich_hotel', "ALPHA_SEQ")
ds.create_logic('poor_hotel', "ALPHA_SEQ")

#Create lines.
line1 = {
    "name" : "Convention Line 1",
    "capacity" : 50,
    "time_func" : 1000,
    "uid" : "line1"
}

line2 = {
    "name" : "Convention Line 2",
    "capacity" : 50,
    "time_func" : 1000,
    "uid" : "line2"
}

ds.create_node(DataStore.STATION, line1)
ds.create_node(DataStore.STATION, line2)

#Create Security

sec1 = {
    "name" : "Security 1",
    "capacity" : 10,
    "time_func" : 100,
    "uid" : "sec1"
}

sec2 = {
    "name" : "Security 2",
    "capacity" : 10,
    "time_func" : 100,
    "uid" : "sec2"
}

ds.create_node(DataStore.STATION, sec1)
ds.create_node(DataStore.STATION, sec2)

#Create Ticketbooth

tb = {
    "name" : "Ticket Booth",
    "capacity" : 2,
    "time_func" : 10,
    "uid" : "tb"
}

ds.create_node(DataStore.STATION, tb)

#Create End Points

convention = {
    "name" : "Convention",
    "uid" : "end1"
}

didnotattend = {
    "name" : "Did not Attend",
    "uid" : "end2"
}

ds.create_node(DataStore.END, convention)
ds.create_node(DataStore.END, didnotattend)

#Now, set directed to for all nodes.

ds.set_directed_to("rich_hotel","line1")
ds.set_directed_to("rich_hotel","line2")
ds.set_directed_to("poor_hotel","line1")
ds.set_directed_to("poor_hotel","line2")

ds.set_directed_to("line1", "sec1")
ds.set_directed_to("line2", "sec2")

ds.set_directed_to("sec1", "tb")
ds.set_directed_to("sec2", "tb")

ds.set_directed_to("tb", "end1")
ds.set_directed_to("tb", "end2")

#Create revenue container from blueprint

revenue = {
    "name" : "Revenue",
    "resource" : "Dollar",
    "init" : {"init" : 0},
    "uid" : "rev"
}

ds.create_blueprint(revenue)
ds.create_container_bp("tb","rev")

#Create tickets container manually

tickets = {
    "name" : "Ticket Storage",
    "resource" : "Ticket",
    "owner" : "tb",
    "init" : {"init" : "inf"},
    "uid" : "ticket_storage"
}

ds.create_container("tb",tickets)

#Now its time to create the logic options for the ticket booth.

ds.create_logic("tb", "BOOL")
ds.create_condition_group("tb", "Conditions", ["end1"], ["end2"])
have_enough_money = {
    "name" : "Have Enough Money",
    "con1_name" : "Wallet",
    "con2_name" : "Revenue",
    "mode" : "entity_value", 
    "op" : ">=",
    "val" : 18
}
ds.add_condition("tb", "Conditions", have_enough_money)
ds.create_action_group("tb", "Conditions")
take_money = {
    "name" : "Take money from Attendee",
    "con1_name" : "Wallet",
    "con2_name" : "Revenue",
    "op" : "TAKE",
    "val" : 18
}
ds.add_action("tb", "Conditions",take_money)
give_ticket = {
    "name" : "Give Attendee Ticket",
    "con1_name" : "Tickets",
    "con2_name" : "Ticket Storage",
    "op" : "GIVE",
    "val" : 1
}
ds.add_action("tb", "Conditions",give_ticket)

(log, summary) = ds.run(3000)

print("First run successful")
""" 
save = ds.serialize()

pprint(save)
 """
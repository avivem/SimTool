from logic import *

#Create environment
env = simpy.Environment()

#Create nodes.
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
rich = StartingPoint(env=env, name="Rich Start", entity_name="Richee", generation=rich_gen, limit=300, uid='st')
poor = StartingPoint(env=env, name="Poor Start", entity_name="Pooree", generation=poor_gen, limit=2000, uid='st')

rich.create_logic("RAND")
poor.create_logic("RAND")

line1 = BasicComponent(env=env, name="Convention Line 1", capacity=50, time_func=1000, uid='line1')
sec1 = BasicComponent(env=env, name="Security 1", capacity=10, time_func=100, uid='sec1')
line2 = BasicComponent(env=env, name="Convention Line 2", capacity=50, time_func=1000, uid='line2')
sec2 = BasicComponent(env=env, name="Security 2", capacity=10, time_func=100, uid='sec2')
tb = BasicComponent(env, name="Ticket Booth", capacity=2, time_func=10, uid='tb')
end1 = EndingPoint(env=env, name="Convention", uid='end1')
end2 = EndingPoint(env=env, name="Didn't attend", uid='end2')

#Define spec for entity wallet
rich_wallet_dict = {
    "name"     : "Wallet",
    "resource" : "Dollar",
    "init"     : {
        "dist"     : "NORMAL",
        "loc"      : 25,
        "scale"    : 5
    },
    "capacity" : 200,
    "uid"      : "container-wallet-rich"
}
rich_wallet_blueprint = BasicContainerBlueprint(**rich_wallet_dict)
rich.add_blueprint(rich_wallet_blueprint)

poor_wallet_dict = {
    'name'     : 'Wallet',
    'resource' : 'Dollar',
    'init'     : {
        'dist'     : 'NORMAL',
        'loc'      : 10,
        'scale'    : 4
    },
    'capacity' : 100,
    'uid'      : 'container-wallet-poor'
}

poor_wallet_blueprint = BasicContainerBlueprint(**poor_wallet_dict)
poor.add_blueprint(poor_wallet_blueprint)

tickets_dict = {
    'name'     : 'Tickets',
    'resource' : 'Ticket',
    'init'     : {
        'init' : 0
    },
    'capacity' : 1,
    'uid'      :  'container-tickets'
}

tickets_blueprint = BasicContainerBlueprint(**tickets_dict)
rich.add_blueprint(tickets_blueprint)
poor.add_blueprint(tickets_blueprint)

rich.set_directed_to(line1)
rich.set_directed_to(line2)
poor.set_directed_to(line1)
poor.set_directed_to(line2)
line1.set_directed_to(sec1)
sec1.set_directed_to(tb)
line2.set_directed_to(sec2)
sec2.set_directed_to(tb)
tb.set_directed_to(end2)
tb.set_directed_to(end1)

#Create containers
revenue_dict = {
    "name" : "Revenue",
    "resource" : "Dollar",
    "init" : {"init" : 0},
    "uid" : "rev"
}

revenue_blueprint = BasicContainerBlueprint(**revenue_dict)
tb.add_container(revenue_blueprint)

ticket_storage_blueprint = BasicContainerBlueprint(**{
    "name" : "Ticket Storage",
    "resource" : "Ticket",
    "init" : {"init" : "inf"},
    "uid" : "ticket_storage"
})
tb.add_container(ticket_storage_blueprint)

tb.create_logic("BOOL")
condition_group = tb.logic.create_condition_group("Condition Group 1",pass_paths=[end1], fail_paths=[end2])
condition_group.add_condition("Have enough to buy Ticket", "Wallet", "Revenue", "e>=v", 18)
action_group = condition_group.create_action_group("Trade Money for Ticket")
action_group.add_action("Take money from Attendee", "Wallet", "Revenue", "TAKE", 18)
action_group.add_action("Give Attendee Ticket", "Tickets", "Ticket Storage", "GIVE", 1)

env.process(rich.run())
env.process(poor.run())
env.run(until=20000)



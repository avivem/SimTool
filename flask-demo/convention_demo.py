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
stsplit = {
    'policy' : 'ALPHA_SEQ'
}

rich.set_split_policy(stsplit)
poor.set_split_policy(stsplit)

line1 = BasicComponent(env=env, name="Convention Line 1", capacity=50, time_func=1000, uid='line1')
sec1 = BasicComponent(env=env, name="Security 1", capacity=10, time_func=100, uid='sec1')
line2 = BasicComponent(env=env, name="Convention Line 2", capacity=50, time_func=1000, uid='line2')
sec2 = BasicComponent(env=env, name="Security 2", capacity=10, time_func=100, uid='sec2')
tbpw = BasicComponent(env, name="Ticket Booth Payment Window", capacity=2, time_func=10, uid='tbpw')
tbtw = BasicComponent(env, name="Ticket Booth Ticket Window", capacity=2, time_func=10, uid='tbtw')
end1 = EndingPoint(env=env, name="Convention", uid='end1')
end2 = EndingPoint(env=env, name="Didn't attend", uid='end2')

#Define spec for entity wallet
wallet_spec_rich = {
    'name'     : 'Wallet',
    'resource' : 'Dollar',
    'dist'     : 'NORMAL',
    'loc'      : 25,
    'scale'    : 5,
    'capacity' : 200,
    'uid'      : 'container-wallet'
}

wallet_spec_poor = {
    'name'     : 'Wallet',
    'resource' : 'Dollar',
    'dist'     : 'NORMAL',
    'loc'      : 10,
    'scale'    : 4,
    'capacity' : 100,
    'uid'      : 'container-wallet'
}
#Add wallet to entities
rich.add_container_spec(wallet_spec_rich)
poor.add_container_spec(wallet_spec_poor)
tickets_spec = {
    'name'     : 'Tickets',
    'resource' : 'Ticket',
    'init'     : 0,
    'capacity' : 1,
    'uid'      :  'container-tickets'
}
rich.add_container_spec(tickets_spec)
poor.add_container_spec(tickets_spec)

rich.set_directed_to(line1)
rich.set_directed_to(line2)
poor.set_directed_to(line1)
poor.set_directed_to(line2)
line1.set_directed_to(sec1)
sec1.set_directed_to(tbpw)
line2.set_directed_to(sec2)
sec2.set_directed_to(tbpw)
tbpw.set_directed_to(tbtw)
tbpw.set_directed_to(end2)
tbtw.set_directed_to(end1)

#Create containers
rev = BasicContainer(env,"Revenue",tbpw,"Dollar",0,uid='rev')
tbpw.add_container(rev)
tickets = BasicContainer(env,"Tickets", tbtw, "Ticket", uid='tickets')
tbtw.add_container(tickets)

tbpwsplit = {
    'policy': "BOOL",
    'cond': "el>=",
    'cond_amount': 18,
    'act' : 'SUB',
    'act_amount' : 18,
    'entity_container_name' : 'Wallet',
    'resource' : 'Dollar',
    'pass' : ['tbtw'],
    'fail' : ['end2']
}
tbpw.set_node_logic_policy(tbpwsplit)

tbtwsplit = {
    'policy': "BOOL",
    'cond': "el==",
    'cond_amount': 1,
    'act' : None,
    'act_amount' : None,
    'entity_container_name' : 'Tickets',
    'resource' : 'Ticket',
    'pass' : ['end1'],
    'fail' : ['end2'] #Should not trigger.
}
tbtw.set_node_logic_policy(tbtwsplit)


env.process(rich.run())
env.process(poor.run())
env.run(until=20000)



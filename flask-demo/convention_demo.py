from logic import *

#Create environment
env = simpy.Environment()

#Create nodes.
st = StartingPoint(env=env, name="Hotel", entity_name="Attendee", gen_fun=10, limit=200, uid='st')
line1 = BasicComponent(env=env, name="Convention Line 1", capacity=50, time_func=1000, uid='line1')
sec1 = BasicComponent(env=env, name="Security 1", capacity=10, time_func=100, uid='sec1')
line2 = BasicComponent(env=env, name="Convention Line 2", capacity=50, time_func=1000, uid='line2')
sec2 = BasicComponent(env=env, name="Security 2", capacity=10, time_func=100, uid='sec2')
tbpw = BasicComponent(env, name="Ticket Booth Payment Window", capacity=2, time_func=10, uid='tbpw')
tbtw = BasicComponent(env, name="Ticket Booth Ticket Window", capacity=2, time_func=10, uid='tbtw')
end1 = EndingPoint(env=env, name="Convention", uid='end1')
end2 = EndingPoint(env=env, name="Didn't attend", uid='end2')

#Define spec for entity wallet
wallet_spec = {
    'name'     : 'Wallet',
    'resource' : 'Dollar',
    'init'     : 6,
    'capacity' : 50,
    'uid'      : 'container-wallet'
}
#Add wallet to entities
st.add_container_spec(wallet_spec)

tickets_spec = {
    'name'     : 'Tickets',
    'resource' : 'Ticket',
    'init'     : 0,
    'capacity' : 1,
    'uid'      :  'container-tickets'
}
st.add_container_spec(tickets_spec)

st.set_directed_to(line1)
st.set_directed_to(line2)
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
    'cond_amount': 5,
    'act' : 'SUB',
    'act_amount' : 5,
    'entity_container_name' : 'Wallet',
    'resource' : 'Dollar',
    'pass' : ['tbtw'],
    'fail' : ['end2']
}
tbpw.set_split_policy(tbpwsplit)

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
tbtw.set_split_policy(tbtwsplit)


env.process(st.run())
env.run(until=20000)



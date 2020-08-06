from logic import *

env = simpy.Environment()

rich_gen = {
    'dist'  : 'NORMAL',
    'loc'   : 100,
    'scale' : 10
}

avg_gen = {
    'dist'  : 'NORMAL',
    'loc'   : 25,
    'scale' : 2
}

poor_gen = {
    'dist'  : 'NORMAL',
    'loc'   : 5,
    'scale' : .8
}
rich = StartingPoint(env=env, name="Rich Start", entity_name="Rich Customer", generation=rich_gen, limit=300, uid='st')
avg = StartingPoint(env=env, name="Average Start", entity_name="Average Client", generation=avg_gen, limit=1000, uid='st')
poor = StartingPoint(env=env, name="Poor Start", entity_name="Poor Client", generation=poor_gen, limit=500, uid='st')

enter = BasicComponent(env=env, name="Enter Bank", time_func=15, uid="enter")
tellers = BasicComponent(env=env, name="Bank Tellers", capacity=8, time_func=100, uid="tellers")
end = EndingPoint(env=env, name="Exit Bank", uid="exit")
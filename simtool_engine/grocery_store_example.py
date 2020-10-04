from simtool_engine.models.simtool_datastore import DataStore
from pprint import pprint

ds = DataStore()

#Starting Point generation settings
rich_gen = {
    'dist'  : 'NORMAL',
    'loc'   : 200,
    'scale' : 8
}

poor_gen = {
    'dist'  : 'NORMAL',
    'loc'   : 30,
    'scale' : 3
}

#Settings for Starting Nodes.
rich_inputs = {
    "name" : "Rich Start",
    "entity_name" : "Rich Person",
    "generation" : rich_gen,
    "limit" : 20,
    "uid" : "rich_start"
}

poor_inputs = {
    "name" : "Poor Start",
    "entity_name" : "Poor Person",
    "generation" : poor_gen,
    "limit" : 200,
    "uid" : "poor_start"
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

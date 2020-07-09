from simpy import Environment

env = Environment()

class test:
    def __init__(self):
        self.x = 1

    def run(self):
        print(f'{env.now} Before')
        yield env.timeout(self.x)
        print(f'{env.now} After')

test1 = test()
env.process(test1.run())
test1.x = 3
env.run()
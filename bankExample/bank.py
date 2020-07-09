import simpy
import random
import numpy as np

delay = 2

class Bank(object):

    def __init__(self, env, num_tellers,  bal, limit):
        self.env = env
        self.num_tellers = num_tellers
        self.bal = bal
        self.limit = limit
        self.tellers = simpy.Resource(env,num_tellers)

#Customers will randomly withdraw or deposit a random amount of money within a daily limit and their own personal limits.
class Customer(object):
    def __init__(self, id, bank, env, wallet, acc_bal, daily_limit):
        self.id = id
        self.env = env
        self.bank = bank
        self.wallet = wallet
        self.acc_bal = acc_bal
        self.daily_limit = daily_limit

    def run(self):
        print(f'[{self.env.now}]:: Customer {self.id} has entered the Bank at time.')
        print(f'        Initial wallet balance: {self.wallet}')
        print(f'        Initial account balance: {self.acc_bal}\n')
        yield self.env.timeout(delay)
        while True:

            if self.daily_limit == 0:
                print(f'[{self.env.now}]:: Customer {self.id} is done banking and has gone home.')
                print(f'        Final wallet balance: {self.wallet}')
                print(f'        Final account balance: {self.acc_bal}\n')
                break

            with self.bank.tellers.request() as request:
                print(f'[{self.env.now}]:: Customer {self.id} is being served by a teller \n')
                yield self.env.timeout(delay)

                #Random choice, but make chance of taking money double.
                withdraw_chance = np.random.binomial(1,2/3)
                if withdraw_chance == 1:
                    if self.acc_bal == 0:
                        print(f'[{self.env.now}]:: Customer {self.id} has decided not to act and leaves the teller.\n')
                        continue
                    else:
                        amount = random.randint(1, self.acc_bal if self.acc_bal < self.daily_limit else self.daily_limit)
                        self.daily_limit -= amount
                        self.acc_bal -= amount
                        print(f'[{self.env.now}]:: Customer {self.id} has decided to withdraw ${amount} \n')
                        yield self.env.timeout(delay)
                        self.bank.bal -= amount
                        self.wallet += amount
                        print(f'[{self.env.now}]:: Customer {self.id} has recieved their funds and have left the Bank \n')
                else:
                    if self.wallet == 0:
                        print(f'[{self.env.now}]:: Customer {self.id} has decided not to act and leaves the teller.\n')
                        continue
                    else:
                        amount = random.randint(1, self.wallet if self.wallet < self.daily_limit else self.daily_limit)
                        self.daily_limit -= amount
                        self.acc_bal += amount
                        print(f'[{self.env.now}]:: Customer {self.id} has decided to deposit the maximum amount \n')
                        yield self.env.timeout(delay)
                        self.bank.bal += amount
                        self.wallet -= amount 
                        print(f'[{self.env.now}]:: Customer {self.id} has deposited their funds and have left the Bank \n')
                    
            print(f'[{self.env.now}]:: Customer {self.id} is taking a break \n')
            yield self.env.timeout(delay)

def manage_sim(env, limit, num_customers, max_customer_wallet, max_customer_acc):

    for i in range(num_customers):
        yield env.timeout(random.randint(1,10))
        customer = Customer(str(i), bank, env, random.randint(0, max_customer_wallet), random.randint(0,max_customer_acc), limit)
        env.process(customer.run())

    
    
print(f'SimPy Bank Demo\n\n')
env = simpy.Environment()
bank = Bank(env, 5, 1000000, 10000)
env.process(manage_sim(env,10000,200, 5000, 50000))
env.run(until=10000)

print(f'Final bank balance: {bank.bal}')

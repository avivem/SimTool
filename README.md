# SimTool

SimTool is an open-source discrete-event simulation tool built for small organizations and businesses to simulate potential scenarios in their workflows and make meaningful decisions.

## Example Demo of App

![alt text](https://github.com/avivem/SimTool/blob/master/conventionex.png?raw=true)

## Project Summary

**Containers**

A holder for a specific type of resource. Can hold up to a specific quantity or be of unlimited size. Any station or entity can hold a container.

**Blueprints**

Blueprints are used to quickly create containers with the same settings. They can be assigned as many time as user want to the start and station nodes. Two nodes can use the same blueprint to make two different containers

**Logic**

To control the behavior of each point in the simulation, conditions and actions can be added. Conditions can verify a list of requirements to decide where entities should go. Actions can move resources between containers.

**Demo of the Simulation**

This simulation will simulate different attendees of a convention
Two category of entities:
  * Wealthy
  * Poor
  
Assumption:
Wealthy people are more willing to enter the convention even if price is high but there is a chance they they will not attend
Regular people may enter convention even if price is high but there is a lower probability of entering than wealthy people
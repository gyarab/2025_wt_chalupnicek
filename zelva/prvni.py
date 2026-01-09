from math import sqrt
from turtle import forward, left, right, exitonclick
from random import randint

def domecek(a):
    forward(a)
    left(90)
    forward(a)
    left(90)
    forward(a)
    left(90)
    forward(a)
    left(90)
    forward(a)

for i in range(36):
    domecek(randint(10, 100))
    right(10)

exitonclick()
from math import sqrt
from turtle import forward, left, right, exitonclick, shape
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

shape(name='turtle')

for i in range(36):
    domecek(randint(10, 100))
    right(10)

exitonclick()
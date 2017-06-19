#!/bin/bash -ev


# data entry (HTTP 200 expected)

curl -v -X POST -H "Content-Type: application/json" -d '
  {
    "college": "Business",
    "name": "Alice",
    "score": 90
  }
' 127.0.0.1:3210/applications


curl -v -X POST -H "Content-Type: application/json" -d '
  {
    "college": "Business",
    "name": "Bob",
    "score": 85
  }
' 127.0.0.1:3210/applications


curl -v -X POST -H "Content-Type: application/json" -d '
  {
    "college": "CompSci",
    "name": "Carly",
    "score": 80
  }
' 127.0.0.1:3210/applications


curl -v -X POST -H "Content-Type: application/json" -d '
  {
    "college": "Business",
    "name": "Dave",
    "score": 95
  }
' 127.0.0.1:3210/applications


curl -v -X POST -H "Content-Type: application/json" -d '
  {
    "college": "CompSci",
    "name": "Eve",
    "score": 100
  }
' 127.0.0.1:3210/applications


curl -v -X POST -H "Content-Type: application/json" -d '
  {
    "college": "CompSci",
    "name": "Alice",
    "score": 100
  }
' 127.0.0.1:3210/applications



# data entry (HTTP 400 expected)

curl -v -X POST -H "Content-Type: application/json" -d '
  {
    "name": "Sans",
    "score": 90
  }
' 127.0.0.1:3210/applications



curl -v -X POST -H "Content-Type: application/json" -d '
  {
    "college": "Business",
    "name": "Alice",
    "score": 90
  }
' 127.0.0.1:3210/applications



# retrieval

curl -v -X GET 127.0.0.1:3210/applicants

curl -v -X GET 127.0.0.1:3210/applicants/Alice
curl -v -X GET 127.0.0.1:3210/applicants/Bob
curl -v -X GET 127.0.0.1:3210/applicants/Carly
curl -v -X GET 127.0.0.1:3210/applicants/Dave
curl -v -X GET 127.0.0.1:3210/applicants/Eve

curl -v -X GET 127.0.0.1:3210/colleges

curl -v -X GET 127.0.0.1:3210/colleges/Business
curl -v -X GET 127.0.0.1:3210/colleges/CompSci


# backup

curl -v -X POST 127.0.0.1:3210/backup

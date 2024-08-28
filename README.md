# Health-records-hyperledger

this app is an implementation of blockchain technology in the medical field
the idea is to implment a permissioned network that keeps  health records and grants specific access rights to the right user ensuring data intergity and patient privacy
the project also enables doctors to have more accurate diagnosis during consultations by checking health records and previous diagnosis

This app is composed of a private blockchain built on hyperledger fabric's basic test network connected through a gateway peer to a Rest API using node js/express js

This app requires the Hyperledger fabric samples 2.0 to function 
you need to follow these steps:
1-download the prerequisits(jdk,node,golang..)
2-clone the fabric samples repo
3-add the current direcory to the fabric-samples/test-network directory
4-change the ca files to match the entity names on the network

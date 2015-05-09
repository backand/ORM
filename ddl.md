Schema Definition with JSON
===========================

A database schema is defined as a JSON array of one or more table definitions:

    <schema> = [  <table>, <table>, ... ]

A table definition is a JSON object with a name and a fields definition:

    <table> = { 'name':  <string>, 'fields' : <fields> }

The fields definition is a JSON object, with an attribute for each field:

    <fields> =  { 'field1' : <field>, 'field2': <field>, ... }

In addition to the fields supplied by the user, Backand defines three standard attributes:

1. 'id' - integer - primary key
2. 'createdAt' - datetime
3. 'updatedAt' - datetime

A field is defined by its type and a set of optional properties. The field definition is a JSON object:

    <field> = { 'type': <type>, <optional properties }

The type of a field is one of the following:

* string
* text
* float
* datetime
* boolean
* binary

We can optionally defined a field as required (`NOT NULL`) or not:

    'required': <boolean value>

Where a boolean value is `true` or `false`.

And set its default value:

    'defaultValue': <value>

Where `<value>` is of the type of the field.

Relationships
=============

One-to-many and many-to-many relationships between tables are specified by means of relatonship fields. A relationship field will generate appropriate foreign relationship fields in the corresponding relations.

**One-to-Many Relationship**

Say we have a one to many relationship between tables R and S. Here for each row in R there are many corresponding rows in S.

In the many side of the relationship (table S), we specify that each row relates to one row in the other table R. 

    'myR' : { 'object' : R }

In the one side of the relationship (table R), we specify that each row relates to several rows in S:

    'Rs' : { 'collection': 'S', 'via' : 'myR' }

In the database, we will have a foreign relationship constraint from S to R, represented by a foreign key field `myR` in the table S. This field will hold the key of the corresponding row in R for each row in S. 

As an example, consider a database describing pet ownership. It has two tables, `person` and `pet`.

Each person can own several pets, but a pet has a single owner. Thus the person-pet relationship is a one to many relationship between person and pet.

The `person` table will have a `pet` a relationship field:

    'pets': { 'collection': 'pet', 'via': 'owner' }

The `pet` table will have an owner `owner` a relationship field:

    'owner': { 'object': 'person' }

**Many-to-Many Relationship**

Say we have a many to many relationship between tables R and S. Thus for each row in R there are many corresponding rows in S, and for each row in S there are many corresponding rows in R.

In both sides of the relationship, we specify the corresponding other side:

in table R, we specify the correspnding S: 

    'Ss' : { 'collection': 'S', 'via' : 'Rs' }

in table S, we specify the correspnding R: 

    'Rs' : { 'collection': 'R', 'via' : 'Ss' }

Because two tables may have several relationships, the via attribute specifies the particular relationship being described.

Such a many-to-many relationship creates a relationship table in the database holding the keys of the corresponding pairs of rows from R and S.

For example, the database of a video content site, there is a `users` table and a `videos` table. Each user has favorite videos. The relationship between users and videos is a many-to-many relationship.

In the `users` table we will have a relationship attribute:

    'favorites' : { 'collection': 'videos', 'via': 'users' }

In the `videos` table we will have a relationship attribute:

    'users' : { 'collection': 'users', 'via': 'favorites' }

A user watches many videos. So the watching relationship is a second many-to-many relationship between users and videos. Accordingly, we will have additional relationship attributes for both users and videos, describing the watching relationship:

In the `users` table we will have a relationship attribute:

    'watched' : { 'collection': 'videos', 'via': 'viewers' }

In the `videos` table we will have a relationship attribute:

    'viewers' : { 'collection': 'users', 'via': 'watched' }

In the database, there will be two relationship tables. One for favorites and one for watchers. 



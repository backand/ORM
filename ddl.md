Model Definition with JSON
===========================

The model represent a database schema that is defined as a JSON array of one or more objects (Table) definitions:

    <model> = [  <object>, <object>, ... ]

An object definition is a JSON object with a name and a fields definition:

    <object> = { 'name':  <string>, 'fields' : <fields> }

The fields definition is a JSON object, with an attribute for each field:

    <fields> =  { 'field1' : <field>, 'field2': <field>, ... }

In addition to the fields supplied by the user, Backand defines one more standard attribute:

1. 'id' - integer - primary key

A field is defined by its type and a set of optional properties. The field definition is a JSON object:

    <field> = { 'type': <type>, <optional properties }

The type of a field is one of the following:

* string - string column up to 255 characters
* text - text column up to 21,844 characters
* float
* datetime 
* boolean

We can optionally defined a field as required (`NOT NULL`) or not:

    'required': <boolean value>

Where a boolean value is `true` or `false`.

And set its default value:

    'defaultValue': <value>

Where `<value>` is of the type of the field.

**One-to-Many Relationship**

One-to-many relationship between tables are specified by means of relatonship fields. A relationship field will generate appropriate foreign relationship fields in the corresponding relations.

Say we have a one to many relationship between tables R and S. Here for each row in R there are many corresponding rows in S.

In the many side of the relationship (object S), we specify that each row relates to one row in the other object R. 

    'myR' : { 'object' : R }

In the one side of the relationship (object R), we specify that each row relates to several rows in S:

    'Rs' : { 'collection': 'S', 'via' : 'myR' }

In the database, we will have a foreign relationship constraint from S to R, represented by a foreign key field `myR` in the object S. This field will hold the key of the corresponding row in R for each row in S. 

As an example, consider a database describing pet ownership. It has two tables, `user` and `pet`.

Each user can own several pets, but a pet has a single owner. Thus the person-pet relationship is a one to many relationship between person and pet:

The `user` object will have a `pets` a relationship field:

    'pets': { 'collection': 'pet', 'via': 'owner' }

The `pet` table will have an owner `owner` a relationship field:

    'owner': { 'object': 'person' }


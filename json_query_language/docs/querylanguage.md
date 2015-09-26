#JSON Query Language

The language is inspired by MongoDB.

A query consists of three parts:

1. fields to be extracted 
2. table
2. expression for filtering the rows


Corresponding to the SQL query:

    SELECT fields
    FROM table
    WHERE expression

We write a query is a JSON object of the form:

    { object: String, q: Expression, fields: Array of String }

The fields may be omitted,

    { object: String, q: Expression }

in which case it becomes:

    SELECT *
    FROM table
    WHERE query

A simple query to retrieve the name and salary of all employees in position of "Sales Manager" is:

    { object: "employees", q: { position : "Sales Manager"  }, fields: ["name", "salary"] }

Queries can compare fields to constants using all the conventional comparison operators. 

To retrieve all fields of employees under the age of 25, 

    { object: "employees", q: { age : { $lt : 25 } }  } 

More generally, an expression can be either an AND expression or an OR expression: 

* an AND expression is a conjunction of conditions on fields. An AND expression is a JSON of the form { A: condition, B: condition, ... }
* an OR expression is a disjunction of conditions, { $or: [ Expression1, Expression2, ...   ] } 

To test employees on age, position, and city, use the and expression:

    { position: "Sales Manager", age : { $lt : 25 }, city: "Boston" }

To find all departments having more than 30 employees, or located in "Los Angeles", 

    { $or: [ { num_employees: { $gt: 30 } }, { location: "Lost Angeles" }  ]  }

Generally, a condition on a field is a predicate can can do one of the following:

1. Test equality of field to a constant value, e.g.  { A: 6 }. Is A equal to 6?


2. Comparison of a field using a comparison operator, e.g. { A: { $gt: 8 }}. Is A greater than 8? 


The set of comparison operators is quite extensive and includes: $lte, $lt, $gte, $gt, $eq, $neq, $not, $size, $exists

3. Test if the value of the field is IN  or NOT IN the result of a subquery.

If we have a subquery that retrieves the department id of each department in New York, 

    { object: "department", "q": { "city" : "New York" }, "fields" : ["id"]}

we test a field dept_id with respect to the result of the subquery as:

    { dept_id: { $in: {  
        { object: "department", "q": { "city" : "New York" }, "fields" : ["id"]}
    }  }}

The result of the subquery should retrieve a single field for this to work.

We use the subquery in a query retrieving all employees of departments located in New York, where the `deptId` field is a reference from the `employees` table to the `department` table, as:

    { object: "employees", "q" : { "deptId" : { $in: 

         { object: "department", "q": { "city" : "New York" }, "fields" : ["id"] }

     } } }

A more complicated query is to retrieve all employees whose department is located in New York such that the employee is located in Boston. We use an AND expression on the two conditions:
 
    { table: "employees", "q" : 

        { 
            deptId": 
            { $in: 
                { object: "department", q: { "city" : "New York" }, fields : ["id"] }
            },
            location: "Boston"
        } 
    }


4. Test for the negation of a comparison. For example, to test if the location field is not Boston, we can do:

    { $not: { location : "Boston" }}


Formally, a condition on a field is a key-value expression of the form: 
     
      Key : ValueExpression

* Key - name of field
* ValueExpression - which has one of the following forms:

    1. Constant - is the field value equal to the constant
    2. Comparison with a comparison operator to a constant 
    3. Inclusion or exclusion in result of a sub query
    3. Negation of another comparison

Negation may sometimes be swapped for comparison. For example, to test if the location field is not equal to Paris, we can

use negation:

    { $not: { location : "Paris" }}


use a not equal operator: 

    { location: { $neq: "Paris" }}

# Algorithm to Generate SQL from JSON Queries

The algorith transforms a JSON to SQL by top-down transformation. 

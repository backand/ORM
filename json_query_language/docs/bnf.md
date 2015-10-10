# BNF Definition of Query Language

	Query ::=  SingleTableQuery | UnionQuery

	SingleTableQuery ::= { object: String, q: Exp, fields: Array of ColumnName, order: SortSpec, limit: Integer, groupBy: Array of ColumnName, aggregate: AggregateSpec }

fields is optional. If omitted all fields are taken.
sort is optional
limit is optional
groupBy is optional, but if present, aggregate and fields should also be present. groupBy must be a subset of fields
aggregate is optional, but if present, groupBy and fields must also be present

	SortSpec ::= Array of [ ColumnName, ColumnOrder ]

	AggregateSpec ::= { ColumnAggregation1, ColumnAggregation2, ... }

	ColumnAggregation ::= ColumnName : AggergationOperator

Columns used in ColumnAggregation must be included in fields and must not be included in groupBy

	ColumnName ::= String

	ColumnOrder ::= asc | desc

	UnionQuery ::= { $union: [Query1, Query2, ... ] }

	ComparisonExp ::= Key : ValueExp

	Exp ::= AndExp | OrExp

	KeyValueExp ::=  Key : ValueExp | ExistExp

	ValueExp ::= Constant | QueryConditional | NotExp

	QueryConditional ::= { ComparisonOperator : Comparand }

	ComparisonOperator ::= $in, $nin, $lte, $lt, $gte, $gt, $eq, $neq, $not, $like

	AggregationOperator ::= $max, $min, $sum, $count, $concat, $avg

	Comparand ::= Constant | Array of Constants | Query

	ExistExp ::= $exists : Query

	NotExp ::= { $not : QueryConditional }

	AndExp ::= { KeyValueExp1, KeyValueExp2, …  }

	OrExp ::=  { $or : [ Exp1, Exp2, ...  ] }

# Variables

Variables to be used in filters are used in queries in place of constants. A variable name has the form: 

    #<string>#

where `string` cannot containt the `#` character.

A variable appears in the query surrounded by quotes, as in:

	'#<string>#'

Variables can be used only if the query is a filter.
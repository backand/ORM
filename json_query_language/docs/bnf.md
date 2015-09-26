# BNF Definition of Query Language

	Query ::=  SingleTableQuery | UnionQuery | JoinQuery

	SingleTableQuery ::= { object: String, q: Exp, fields: Array of String, limit: Integer, sort: SortSpec }

fields is optional. If omitted all fields are taken.
limit is optional
sort is optional

	SortSpec ::= Array of [ ColumnName, ColumnOrder ]

	ColumnName ::= String

	ColumnOrder ::= asc | desc

	UnionQuery ::= { union: [Query1, Query2, ... ] }

	JoinQuery ::= { join: Array of Query, on: Array of ComparisonExp }

	ComparisonExp ::= Key : ValueExp | Key : Key

	Exp ::= AndExp | OrExp

	KeyValueExp ::=  Key : ValueExp | ExistExp

	ValueExp ::= Constant | QueryConditional | NotExp

	QueryConditional ::= { ComparisonOperator : Comparand }

	ComparisonOperator ::= $in, $nin, $lte, $lt, $gte, $gt, $eq, $neq, $not, $size

	Comparand ::= Constant | Array of Constants | Query

	ExistExp ::= $exists : Query

	NotExp ::= { $not : QueryConditional }

	AndExp ::= { KeyValueExp1, KeyValueExp2, …  }

	OrExp ::=  { $or : [ Exp1, Exp2, ...  ] }
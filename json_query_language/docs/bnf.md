# BNF Definition of Query Language

	Query ::=  SingleTableQuery | UnionQuery

	SingleTableQuery ::= { object: String, q: Exp, fields: Array of String, order: SortSpec, limit: Integer }

fields is optional. If omitted all fields are taken.
sort is optional
limit is optional

	SortSpec ::= Array of [ ColumnName, ColumnOrder ]

	ColumnName ::= String

	ColumnOrder ::= asc | desc

	UnionQuery ::= { $union: [Query1, Query2, ... ] }

	ComparisonExp ::= Key : ValueExp

	Exp ::= AndExp | OrExp

	KeyValueExp ::=  Key : ValueExp | ExistExp

	ValueExp ::= Constant | QueryConditional | NotExp

	QueryConditional ::= { ComparisonOperator : Comparand }

	ComparisonOperator ::= $in, $nin, $lte, $lt, $gte, $gt, $eq, $neq, $not, $like

	Comparand ::= Constant | Array of Constants | Query

	ExistExp ::= $exists : Query

	NotExp ::= { $not : QueryConditional }

	AndExp ::= { KeyValueExp1, KeyValueExp2, …  }

	OrExp ::=  { $or : [ Exp1, Exp2, ...  ] }
# BNF Definition of Query Language

	Query ::= { table: String, q: Exp, fields: Array of String }

Fields is optional. If omitted all fields are taken.

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
{
	"table" : "Employees",
	"q" : {
		"$or" : [
			{
				"Budget" : {
					"$gt" : 3000
				}
			},
			{
				"Location" : "Tel Aviv"
			}
		]
	}
}
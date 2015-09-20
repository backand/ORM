{
	"table" : "Employees",
	"q": {
		"DeptId" : {
			"$in" : {
				"table" : "Dept",
				"q": {
					"Budget" : {
						"gt" : 4500
					}
				},
				"fields" : [
					"DeptId"
				]
			}
		}
	}
}
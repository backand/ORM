using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Script.Serialization;

namespace ConsoleApplication1
{
    class Program
    {
        static JavaScriptSerializer jsonParser;

        static void Main(string[] args)
        {
            String s = @"{ 	""table"" : ""Employees"",	""q"" : {		""$or"" : [			{				""Budget"" : {					""$gt"" : 3000				}		},{				""Location"" : ""Tel Aviv""			}		]}}";
            String sql = transformJson(s);
            System.Console.WriteLine(sql);
        }


        static String transformJson(String s) {
	        String sqlQuery = null;
	        try { 
                jsonParser = new JavaScriptSerializer();
                Object json = jsonParser.DeserializeObject(s);
	            Dictionary<String, Object>jsonDictionary = jsonParser.ConvertToType<Dictionary<String, Object>>(json);
	            sqlQuery = generateQuery(jsonDictionary);
                return sqlQuery;
	        }
	        catch (Exception exp) {
		        System.Console.WriteLine(exp.Message);
                return sqlQuery;
	        }
	        finally{
		        
	        }
        }

        static String generateQuery(IDictionary<String, Object> query){
	        if (!isValidQuery(query))
		        throw new Exception("not valid query");


	        String selectClause = "SELECT ";
            if (query.ContainsKey("fields")){
                String[] fields = (String[]) query["fields"];
                selectClause += String.Join(",", fields);
            }
            else
                selectClause += "*";
	        String fromClause = "FROM " + query["table"];
	        String whereClause = "";
	        whereClause = generateExp(query["q"]);

	        String sqlQuery = selectClause + " " + fromClause + " " + (whereClause != "" ? "WHERE (" + whereClause + " )" : "");
	
	        return sqlQuery;
        }

        static String generateExp(Object exp){
	        if (isOrExp(exp)){ // OrExp
		        Object[] orExpArray = ((Object[])(((Dictionary<String, Object>)exp)["$or"])).Select(x => generateExp(x)).ToArray();
                return String.Join(" OR ", orExpArray.Select(o => "( " + o + " )").ToArray());
	        }
	        else if (isValidAndExp(exp)) { // AndExp
                Dictionary<String, Object>d = (Dictionary<String, Object>)exp;
		        String[] keys = getDictionaryKeysArray(d);
		        if (keys.Length > 0){

                    String[] andExpArray = keys.Select(a => { 
                    
                        Dictionary<String, Object> keyValueExp = new Dictionary<String, Object>();
                        keyValueExp.Add(a, d[a]);
				        String r = generateKeyValueExp(keyValueExp);
				      
				        return r;
                    }).ToArray();

			       
			        
			        return String.Join(" AND ", andExpArray);
		        }
		        else{
			        return " 1 == 1 ";
		        }
		
	        }
	        else {
		        throw new Exception("not valid query");
	        } 
        }

        static Boolean isValidQuery(IDictionary<String, Object> q){
	        return q.ContainsKey("q") && q.ContainsKey("table");
        }

        static Boolean isOrExp(Object exp){
	
	        if (!isJSONObject(exp))
		        return false;

            Dictionary<String,Object>expDictionary = (Dictionary<String, Object>)exp;
            String[] arrayKeys = getDictionaryKeysArray(expDictionary);
	        String column = arrayKeys[0];
	        return arrayKeys.Length == 1 && column == "$or" && expDictionary[column].GetType().IsArray;
        }

        static String[] getDictionaryKeysArray(Dictionary<String, Object> d)
        {
            Dictionary<String, Object>.KeyCollection keysCollection = d.Keys;
            String[] arrayKeys = new string[keysCollection.Count];
            keysCollection.CopyTo(arrayKeys, 0);
            return arrayKeys;
        }

        static Boolean isValidAndExp(Object exp){
	        
	        if (!isJSONObject(exp))
		        return false;
	        return true;
        }


        static String generateKeyValueExp(Dictionary<String,Object>kv){

	        String[] keys = getDictionaryKeysArray(kv);
	        String column = keys[0];
	        if (isConstant(kv[column])){ // constant value
		        return column + " = " + kv[column];
	        }

            Boolean isDictionary = false;
            
            try {
                Type t = kv[column].GetType().GetInterface("IDictionary");
                if (t != null){
                    isDictionary = true;
                }
            }
            catch(Exception e){
                
            }
            
             if (isDictionary){
                Dictionary<String, Object>d = (Dictionary<String, Object>)kv[column];
                if (d.ContainsKey("$not")){ // Not Exp value
                    return "NOT " + generateQueryConditional(d["$not"]);
                }
             }   
                

	        // Query Conditional value
		    return column + " " + generateQueryConditional(kv[column]);
	        
        }



        static String generateQueryConditional(Object qc){
            Dictionary<String, Object> d = (Dictionary<String, Object>)qc;
	        String[] keys = getDictionaryKeysArray(d);
	        String comparisonOperator = keys[0];
            if (!isValidComparisonOperator(comparisonOperator))
    	        throw new Exception("not valid query Conditional");

	        Object comparand = d[comparisonOperator];
	        String generatedComparand = " ";
	        if (isConstant(comparand)){
		        generatedComparand = comparand.ToString();
	        }
	        else if (comparand.GetType().IsArray){ // array
		        generatedComparand = String.Join(" , ", (String[])comparand);
	        }
	        else{ // sub query
		        generatedComparand = "( " + generateQuery((Dictionary<String, Object>)comparand) + " )";
	        }
	        String r = comparisonOperator + " " + generatedComparand;
	      
	        return r;
        }

        static Boolean isConstant(Object value){
	        return isNumeric(value.GetType()) || value.GetType() == typeof(System.String) || value.GetType() == typeof(System.Boolean);
        }

        static Boolean isValidComparisonOperator(String comparisonOperator){
            String[] operators = new String[] { "$in", "$nin", "$lte", "$lt", "$gte", "$gt", "$eq", "$neq", "$not", "$size", "$exists" };
	        int pos = Array.IndexOf(operators, comparisonOperator);
            return (pos >- 1);
        }

        static Boolean isJSONObject(Object value){
            return !(value.GetType() == typeof(System.String))  && !isNumeric(value.GetType());
        }


        static Boolean isNumeric(Type dataType)
        {
            if (dataType == null)
                return false;

            return (dataType == typeof(int)
                || dataType == typeof(double)
                || dataType == typeof(long)
                || dataType == typeof(short)
                || dataType == typeof(float)
                || dataType == typeof(Int16)
                || dataType == typeof(Int32)
                || dataType == typeof(Int64)
                || dataType == typeof(uint)
                || dataType == typeof(UInt16)
                || dataType == typeof(UInt32)
                || dataType == typeof(UInt64)
                || dataType == typeof(sbyte)
                || dataType == typeof(Single)
            );
        }

    }
}


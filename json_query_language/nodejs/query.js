
{ Table: Employees, Q: { DeptId:  {  $in :  


  {  Table: Dept,   


     Q:  {  Budget: {  $gt: 4500  }  },   

     Fields: ["DeptId"]   


   }  



   }  


 }}


 select *
 from Employees
 where DeptId in (

    select DeptId
    from Dept
    where Budget > 4500

  )



select *
 from Employees
 where City in (

    select City
    from Dept
    where Population > 10000

  )
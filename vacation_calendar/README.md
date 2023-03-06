# Vacation calendar generator

A JavaScript library for generating a calendar that tracks used and remaining
paid time-off based on a list of provided dates.

Example: [Sample calendar](sample_calendar.html)

Expected usage:

1. Copy `calendar_generator.js` to the location where you want to serve
   calendars (a web server or a local directory)

2. Create an HTML file for the month in that same location.  Use the provided
   `sample_calendar.html` file as a template.
   
3. Edit the calendar file to define your company's paid-time-off policies:

   * Define your company, name and the year
   
     * Change the `company` variable to the name of your company
     * Change the `name` variable to your name
     * Change the `year` variable to the year of the calendar that will be
       generated.
       
   * Define how much paid time off your company gives you, by editing fields in
     the `pto_counts` object.  If your company does not give you days in a
     given category, set it to 0 or delete the line.
     
     * `floating` is the number of "floating holiday" days
     * `personal` is the number of "personal leave" days
     * `sick` is the number of sick days
     * `vacation` is the number of vacation days
     * `volunteer` is the number of volunteer days (e.g. for charity work)
     
   * Define how many days of vacation and sick leave you are carrying in from
     the previous year:
     
     * `vacation_carryin` is the number of vacation days
     * `sick_carryin` is the number of sick days
     
   * If your company permits sale of unused vacation, and you wish to sell
     vacation, add a `vacation_sold` line.  Sold vacation days are always
     debited from the December balance.
     
   * Define your company's vacation and sick-leave accrual and carryover
     policies, by editing fields in the `pto_counts` object.
     
     * `vacation_accrual` should be `true` if your vacation accrues over time.
       For example, if you are paid bi-monthly (2 paychecks per month or 24 per
       year), and you have 15 days vacation, an accrual policy would grant you
       0.625 days per pay period or 1.25 days per month.
       
       If your company block-grants all vacation at the start of the year, then
       set this variable to `false` or delete the line.
       
     * `vacation_carryover_limit` is the maximum number of vacation days you
       are allowed to carry over from one year to the next.  If you exceed this
       number, the generated calendar will include a warning.
       
       If your company does not limit vacation carryover, delete this line.
       
     * `max_vacation_accrual` is the maximum number of vacation days that can
       be accrued at once.  If the total count for a month exceeds this number,
       it will be called out by printing the count in red.
       
       If your company does not limit vacation accrual, delete this line.
       
     * `sick_accrual` should be `true` if your sick leave accrues over time.
       If your company block-grants all sick leave at the start of the year,
       then set this variable to `false` or delete the line.
       
     * `sick_carryover_limit` is the maximum number of sick days you are
       allowed to carry over from one year to the next.  If you exceed this
       number, the generated calendar will include a warning.
       
       If your company does not limit sick-leave carryover, delete this line.
       
     * `max_sick_accrual` is the maximum number of sick days that can be
       accrued at once.  If the total count for a month exceeds this number, it
       will be called out by printing the count in red.
       
       If your company does not limit sick-leave accrual, delete this line.
       
   * If you are paid bi-weekly, then some months will have to paychecks and
     some will have three.  Set the `three_check_months` array to be a list of
     the three-check months, so vacation accruals will be computed correctly.

4. Edit the calendar file to define all the days you will be taking for PTO in
   the `pto_data` array:

   Each row of the array is a single PTO event.  Each row consists of five
   values:
   
   1. **month**  
      The month of the PTO event.  1 is January.  12 is December.

   2. **day**  
      The day of the PTO event

   3. **type**  
      The type of PTO.  This affects the color used to highlight the
      date in the calendar, and which running count of available PTO will be
      adjusted.  The valid types are currently:
      
      * **b**  
        Bereavement leave.  These days are not tracked because most company
        policies don't impose limits (since is is an exceptional circumstance)
        
      * **f**  
        Floating holiday.  Some companies treat these like vacation days, while
        some impose rules for their use (e.g. can only take a whole day off, or
        may require justification).
      
      * **h**  
        Company holiday.  These are defined your company.  Provide them here so
        the days can be indicated on the calendar.
        
      * **p**  
        Personal leave.  Some companies treat these like vacation days, while
        some impose rules for their use.
        
      * **s**  
        Sick leave.  Some companies treat these like vacation days, while some
        impose rules for their use.
        
      * **v**  
        Vacation
        
      * **vo**  
        Volunteer leave.  This is typically a day off that must be spent
        performing a company-approved or company-sponsored volunteer activity.

      * **w**  
        Working day.  This is used to indicate when you are working on a
        weekend.  Its sole purpose is to remove the "time off" indication that
        is normally applied to all weekend dates.
        
   4. **Days**  
      The number of days PTO to be taken on the date.  Typically, this will be
      the number 1 or a fraction (if only a partial day is taken off), but
      there are exceptions.
      
      Negative numbers and numbers greater than 1 may be used to adjust PTO
      counts for exceptional circumstances for which the calendar-generation
      script can not compute.  For example, if your annual allotment for
      vacation days increases mid-year.
      
   5. **Description**  
      A brief description of the PTO event.  The text will appear in the
      calendar as a tool-tip for the date.

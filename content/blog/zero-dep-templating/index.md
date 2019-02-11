---
title: Zero Dependency HTML templating in 12 lines of Javascript
date: "2018-11-12T12:30:37.000Z"
---

This is a piece of code I wrote for a previous blog post about writing a Custom Mocha Reporter. I wanted to generate HTML output from a template, but I didn’t need much functionality or an extra dependency. Turns out, it’s not that difficult.

Programmatically generating or producing HTML is not rocket science. The typical approach is:

1. Build a HTML template close to what you want.
2. Identify the variable parts of the template you want to change.
3. Write your code to get the replacement parts.
4. Use a templating engine to load the HTML and replace the variables with the replacement parts.

There are loads of templating engines out there. [Mustache](https://www.npmjs.com/package/mustache) is one. [Handlebars](http://tryhandlebarsjs.com/), [doT](http://olado.github.io/doT/index.html) and [EJS](http://ejs.co/) also do the job. They all basically work the same, but they all represent an extra dependency that we don’t need. We’re not doing anything complex here, and I’d rather keep this package with zero dependencies. So build it ourselves.

##Regular Expressions

![Figure 1: word replacement.](./img1.png)

*Artists impression of a lake surrounded by red cabbage and carrots fields.*

Regular expressions (regex) are a **wonderful, powerful and complex** concept that I wont get into in too much detail. Basically, a regular expression allows you to define an “expression”, or pattern, that can be used to find specific sequences in a body of text. A common use of regex is to find a substring, and replace it. Regex can also be used to validate data, ensuring it conforms to some structure (ie. phone numbers contain only numbers and are 10 digits long)

##Replacing a String.
Regex are not unique to Javascript, and even within JS, there are multiple ways to utilise them. In our case, we’ll use the ```string.replace()``` method. ([full documentation here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace))

```
str.replace(regexp|substr, newSubstr|function)
```

We’re going to take a string called ```template``` and find every occurrence of words surrounded by double squiggly brackets like so: ```{{word}}``` . Then we’re going to replace that word with a value we have generated — in the case of the Mocha reporter, we used the output of our tests, but it can be anything at all.

**For example**, say we have calculated the percent of tests that ran successfully as: run_percent , and in our template we have written ```{{run_percent}}```. We could write:  
```
template.replace(/{{run_precent}}/g, run_percent)
```

> The [regex literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Creating_a_regular_expression) is surrounded by forward slashes. The ‘g’ means [search globally](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/global).

##Replacing Multiple Strings

But we can do better. We can find any word surrounded by squigglies with the following regex: ```/{{.*?}}/g```

> ```.``` means any character except a newline.  
> ```*``` means match the previous thing 0 or more times.  
> ```?``` means make the previous thing ‘non-greedy’ — ie. The shortest possible match.

Finally, we’re not just going to replace every word in squigglies with just one value. If we pass a function as the second parameter to ```replace()```, we can be much smarter…

```javascript
let newContent = template.replace(/{{.*?}}/g, function(match){
  return replacements[match]
})
```

Here,Match is the word that is found by the regex. replacements is an object with keys for each of our template variables (the squigglies), and values for what we want to replace them with. Here’s an example:

```javascript
// Example of replacements object
{
      "{{lastrun_date}}": new Date(),
      "{{run_percent}}": run_percent,
      "{{run_numerator}}": sum,
      "{{run_denominator}}": total
}
```

Wrapping it all up with the file reading/writing code in a nice little function (called updateBillboard in our reporter) and we have our templating engine in [12 lines of Javascript](https://github.com/aido179/apb-mocha-reporter/blob/140e22119925142dd2d09bd22dd62764bbd46799/src/apbmochareporter.js#L91):

```javascript
function updateBillboard(replacements){  
  content = fs.readFileSync(`template.html`, {encoding:'utf8'})
  let newContent = content.replace(/{{.*?}}/g,
    function(match){
      return replacements[match]
    })
  let output= `/output.html`
  if (!fs.existsSync(output_dir)){
    fs.mkdirSync(output_dir);
  }
  fs.writeFileSync(output, newContent)
  return output
}
```

##Conclusion

Obviously, this isn’t going to be suitable for anything with complex templating needs. But, in my opinion, installing a whole extra package just to replace a few values in a file is overkill.

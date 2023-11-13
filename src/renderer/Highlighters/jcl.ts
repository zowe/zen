/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import * as monaco from 'monaco-editor';

interface MonarchLanguageRule {
  regex: RegExp;
  action: { token: string, log?: any, next?: any };
}

interface JclHilite {
  defaultToken: string;
  ignoreCase: boolean;
  brackets: JclBracket[];
  tokenizer: {
      [category: string]: MonarchLanguageRule[];
  };
}

type Theme = monaco.editor.IStandaloneThemeData;

const jclDebug = '';      //Null, undefined or empty string for production environment

const JCL_KEYWORDS = '(CNTL|DD|EXEC|EXPORT|JOB|INCLUDE|JCLLIB|OUTPUT|PROC|SCHEDULE|SET|XMIT|COMMAND|JOBGROUP|\
GJOB|JOBSET|SJOB|ENDSET|AFTER|BEFORE|CONCURRENT|ENDGROUP)';
const JCL_KEYWORDS_SPECIAL = '(ENDCNTL|EXPORT|ELSE|ENDIF|PEND|THEN)';

interface JclBracket {
  open: string;
  close: string;
  token: string;
}

export const JCL_HILITE: JclHilite = {
// Set defaultToken to invalid to see what you do not tokenize yet
  defaultToken: 'default',
  ignoreCase: false,
  
  brackets: [ 
    { open: '(', close: ')', token: 'jcl-delimiter' }, ],

// Expand tokenizer via: https://microsoft.github.io/monaco-editor/monarch.html
// Logging for debugging: 
//    o [$S0] - displays the state
//    o <nnn> - which hilite style is used
//    o -> nnn - which state is next or '---' for none (= use the current state again)
//    o '$0' - shows the regex match
  tokenizer: {
    root: [
      {regex: /^\/\/\*.*$/, action: {token: 'jcl-comment', log: jclDebug && '[$S0] <comment> -> --- \'$0\''} }, //Comment begins with //*, lasts until end of line
      {regex: /, *$/, action: { token: 'jcl-delimiter', next: '@operands2', log: jclDebug && '[$S0] <delimiter> -> operands2 \'$0\'' }}, //Checks for end of line with a ','
      {regex: / *\n| *$/, action: { token: 'jcl-default', next: '@popall', log: jclDebug && '[$S0] <default> -> popall \'$0\'' }}, //Checks for end of line without a ','
      {regex: /,( +)[0-9]+$/, action: { token: 'jcl-delimiter', next: '@operands2', log: jclDebug && '[$S0] <delimiter> -> operands2 \'$0\'' }}, //Checks for ',' + linenumber + linebreak (continuation of statement)
      {regex: /( *)[0-9]+$/, action: { token: 'jcl-default', log: jclDebug && '[$S0] <default> -> --- \'$0\'' }}, //Checks for linenumber + linebreak (new JCL statement)
      {regex: /( +)/, action: { token: 'whitespace', log: jclDebug && '[$S0] <whitespace> ->  --- \'$0\'' }}, //Removes any previous line spaces
      {regex: /^\/\*[ ]*$/, action: { token: 'jcl-statement', log: jclDebug && '[$S0] <statement> -> ---' }},  //Starts with /* followed by end or spaces and end
      {regex: /^\/\*[ ]/, action: { token: 'jcl-statement', next: '@comments', log: jclDebug && '[$S0] <statement> -> comments \'$0\'' }}, //Statements begin with /*space ...
      {regex: /^\/\*/, action: { token: 'jcl-statement', next: '@nameFirstChar', log: jclDebug && '[$S0] <statement> -> nameFirstChar \'$0\'' }}, //Statements begin with /* ...
      {regex: /^\/\//, action: { token: 'jcl-statement', next: '@nameFirstChar', log: jclDebug && '[$S0] <statement> -> nameFirstChar \'$0\'' }}, // or //
      {regex: /.*/, action: { token: 'jcl-none', log: jclDebug && '[$S0] <none> -> --- \'$0\'' }}, //When a token doesn't match, the line is blue
    ],
    nameFirstChar: [
      { regex: /[ ]/, action: { token: 'jcl-default', next: '@operator', log: jclDebug && '[$S0] <default> -> operator \'$0\'' } }, //Name must start with capital or national symbols
      { regex: /[A-Z|@|#|$| ]/, action: { token: 'jcl-default', next: '@name', log: jclDebug && '[$S0] <default> -> name \'$0\'' } }, //Name must start with capital or national symbols (space is for 1 letter label)
      { regex: /./, action: { token: 'jcl-invalid', next: '@name', log: jclDebug && '[$S0] <invalid> -> name \'$0\'' } }, //For everything else

    ],
    name: [ 
      { regex: /[A-Z|@|#|$|\.|0-9]{0,16}/, action: { token: 'jcl-default', next: '@invalidName', log: jclDebug && '[$S0] <default> -> invalidName \'$0\'' } }, //Name must be between {0, 16} characters
      { regex: /, *$/, action: { token: 'jcl-delimiter', next: '@operands2', log: jclDebug && '[$S0] <delimiter> -> operands2 \'$0\'' } }, //Checks for end of line with a ','
      { regex: / *\n| *$/, action: { token: 'jcl-default', next: '@popall', log: jclDebug && '[$S0] <default> -> popall \'$0\'' } }, //Checks for end of line without a ','
      { regex: /,( +)[0-9]+$/, action: { token: 'jcl-delimiter', next: '@operands2', log: jclDebug && '[$S0] <delimiter> -> operands2 \'$0\'' } }, //Checks for ',' + linenumber + linebreak (continuation of statement)
      { regex: /( *)[0-9]+$/, action: { token: 'jcl-default', next: '@popall', log: jclDebug && '[$S0] <default> -> popall \'$0\'' } }, //Checks for linenumber + linebreak (new JCL statement)
      { regex: /( +)/, action: { token: 'whitespace', next: '@operator', log: jclDebug && '[$S0] <whitespace> -> operator \'$0\'' } }, //Spaces(s) designate when to check for operator keywords after name
      { regex: /'.*'/, action: { token: 'jcl-string', next: '@strings', log: jclDebug && '[$S0] <string> -> string \'$0\'' } },
      { regex: /[^A-Z|@|#|$|0-9]/, action: { token: 'jcl-invalid', log: jclDebug && '[$S0] <invalid> -> ---\'$0\'' } }, // Checks for invalid JCL characters in names
      { regex: /./, action: { token: 'jcl-default', log: jclDebug && '[$S0] <default> -> --- \'$0\'' } }

    ],

    invalidName: [
      {regex: / *\n| *$/, action: { token: 'jcl-default', next: '@popall', log: jclDebug && '[$S0] <default> -> popall \'$0\'' }}, //Checks for end of line without a ','
      {regex: /( +)/, action: { token: 'jcl-invalid', next: '@operator', log: jclDebug && '[$S0] <invalid> -> operator \'$0\'' }}, //Name must be between {0, 8} characters
      {regex: /./, action: { token: 'jcl-invalid', log: jclDebug && '[$S0] <invalid> -> --- \'$0\'' }}, //Name must be between {0, 8} characters
    ],
    operator: [
      {regex: /, *$/, action: { token: 'jcl-delimiter', next: '@operands2', log: jclDebug && '[$S0] <delimiter> -> operands2 \'$0\'' }}, //Checks for end of line with a ','
      {regex: / *\n| *$/, action: { token: 'jcl-default', next: '@popall', log: jclDebug && '[$S0] <default> -> popall \'$0\'' }}, //Checks for end of line without a ','
      {regex: /!/, action: { token: 'jcl-invalid', next: '@operands', log: jclDebug && '[$S0] <invalid> -> operands \'$0\'' }}, // Checks for invalid JCL characters
      {regex: /[a-z]+/, action: { token: 'jcl-invalid', next: '@operands', log: jclDebug && '[$S0] <invalid> -> operands \'$0\'' }}, // Checks for invalid lowercase JCL
      {regex: /(,|&|=|\^)/, action: { token: 'jcl-delimiter', next: '@operands', log: jclDebug && '[$S0] <delimiter> -> operands \'$0\'' }},
      {regex: /'/, action: { token: 'jcl-string', next: '@strings', log: jclDebug && '[$S0] <string> -> string \'$0\'' }},
      {regex: /[()]/, action: { token: '@brackets' }},
      {regex: /(IF)/, action: { token: 'jcl-operator', next: '@if', log: jclDebug && '[$S0] <operator> -> if \'$0\'' }}, //If is special, gets its own logic
      {regex: new RegExp(JCL_KEYWORDS + " *$"), action: { token: 'jcl-operator', next: '@popall', log: jclDebug && '[$S0] <operator> -> popall \'$0\'' }},
      {regex: new RegExp(JCL_KEYWORDS + " +"), action: { token: 'jcl-operator', next: '@operands', log: jclDebug && '[$S0] <operator> -> operands \'$0\'' }},
      {regex: new RegExp(JCL_KEYWORDS_SPECIAL + " *$"), action: { token: 'jcl-operator', next: '@popall', log: jclDebug && '[$S0] <operator> -> popall \'$0\'' }},
      {regex: new RegExp(JCL_KEYWORDS_SPECIAL + " +"), action: { token: 'jcl-operator', next: '@comments', log: jclDebug && '[$S0] <operator> -> comments \'$0\'' }},
      {regex: /[^\s\\a-z(,|&|=|\^)]+/, action: { token: 'jcl-default', next: '@operands', log: jclDebug && '[$S0] <default> -> operands \'$0\'' }}, //Matches the rest
    ],
    if: [
      {regex: /, *$/, action: { token: 'jcl-delimiter', next: '@operands2', log: jclDebug && '[$S0] <delimiter> -> operands2 \'$0\'' }}, //Checks for end of line with a ','
      {regex: / *\n| *$/, action: { token: 'jcl-default', next: '@popall', log: jclDebug && '[$S0] <default> -> popall \'$0\'' }}, //Checks for end of line without a ','
      {regex: /(THEN )/, action: { token: 'jcl-operator', next: '@comments', log: jclDebug && '[$S0] <operator> -> comments \'$0\'' }},
      {regex: /./, action: { token: 'jcl-variable', log: jclDebug && '[$S0] <variable> -> --- \'$0\'' }},
    ],
    operands: [
      {regex: /,( +)[0-9]+$/, action: { token: 'jcl-delimiter', next: '@operands2', log: jclDebug && '[$S0] <delimiter> -> operands2 \'$0\'' }}, //Checks for ',' + linenumber + linebreak (continuation of statement)
      {regex: /( *)[0-9]+$/, action: { token: 'jcl-default', next: '@popall', log: jclDebug && '[$S0] <default> -> popall \'$0\'' }}, //Checks for linenumber + linebreak (new JCL statement)
      {regex: /, *$/, action: { token: 'jcl-delimiter', next: '@operands2', log: jclDebug && '[$S0] <delimiter> -> operands2 \'$0\'' }}, //Checks for end of line with a ','
      {regex: / *\n| *$/, action: { token: 'jcl-default', next: '@popall', log: jclDebug && '[$S0] <default> -> popall \'$0\'' }}, //Checks for end of line without a ','
      {regex: /, /, action: { token: 'jcl-delimiter', next: '@comments', log: jclDebug && '[$S0] <delimiter> -> comments \'$0\'' }}, //Checks for , + space (leads to comment)
      {regex: /'/, action: { token: 'jcl-string', next: '@strings', log: jclDebug && '[$S0] <string> -> string \'$0\'' }},
      {regex: /!/, action: { token: 'jcl-invalid', log: jclDebug && '[$S0] <invalid> -> --- \'$0\'' }}, // Checks for invalid JCL characters
      {regex: /[a-z]+/, action: { token: 'jcl-invalid', log: jclDebug && '[$S0] <invalid> -> --- \'$0\'' }}, // Checks for invalid lowercase JCL
      {regex: /(,|&|=|\^)/, action: { token: 'jcl-delimiter', log: jclDebug && '[$S0] <delimiter> -> --- \'$0\'' }},
      {regex: /[)]$/, action: { token: 'jcl-delimiter', next:'@popall', log: jclDebug && '[$S0] <delimiter> -> popall \'$0\'' }},
      {regex: /[()]/, action: { token: '@brackets'} },
      {regex: / /, action: { token: 'jcl-variable', next: '@comments', log: jclDebug && '[$S0] <variable> -> comments \'$0\'' }},//Space leads to comments
      {regex: /\*$/, action: { token: 'jcl-variable', next: '@popall', log: jclDebug && '[$S0] <variable> -> popall \'$0\'' }}, //(*) as last char
      {regex: /.$/, action: { token: 'jcl-variable', next: '@popall', log: jclDebug && '[$S0] <variable> -> popall \'$0\'' }}, //For end 
      {regex: /./, action: { token: 'jcl-variable', log: jclDebug && '[$S0] <variable> -> --- \'$0\'' }}, //For everything else
      
    ],
    operands2: [ //JCL has a behavior where it will accept two sets of operands before detecting comments
                //for certain conditions, usually when statements are continued via a ','
      {regex: /, *$/, action: { token: 'jcl-delimiter', next: '@operands2', log: jclDebug && '[$S0] <delimiter> -> operands2 \'$0\'' }}, //Checks for end of line with a ','
      {regex: / *\n| *$/, action: { token: 'jcl-default', next: '@popall', log: jclDebug && '[$S0] <default> -> popall \'$0\'' }}, //Checks for end of line without a ','
      {regex: /,( +)[0-9]+$/, action: { token: 'jcl-delimiter', next: '@operands2', log: jclDebug && '[$S0] <delimiter> -> operands2 \'$0\'' }}, //Checks for ',' + linenumber + linebreak (continuation of statement)
      {regex: /( *)[0-9]+$/, action: { token: 'jcl-default', next: '@popall', log: jclDebug && '[$S0] <default> -> popall \'$0\'' }}, //Checks for linenumber + linebreak (new JCL statement)
      {regex: /, /, action: { token: 'jcl-delimiter', next: '@comments', log: jclDebug && '[$S0] <delimiter> -> comments \'$0\'' }}, //Checks for , + space (leads to comment)
      {regex: /'/, action: { token: 'jcl-string', next: '@strings', log: jclDebug && '[$S0] <string> -> string \'$0\'' }},
      {regex: /!/, action: { token: 'jcl-invalid', log: jclDebug && '[$S0] <invalid> -> --- \'$0\'' }}, // Checks for invalid JCL characters
      {regex: /[a-z]+/, action: { token: 'jcl-invalid', log: jclDebug && '[$S0] <invalid> -> --- \'$0\'' }}, // Checks for invalid lowercase JCL
      {regex: /(,|&|=|\^)/, action: { token: 'jcl-delimiter', log: jclDebug && '[$S0] <delimiter> -> --- \'$0\'' }},
      {regex: /[()]/, action: { token: '@brackets'} },
      {regex: / +/, action: { token: 'jcl-variable', next: '@operands', log: jclDebug && '10. [$S0] <variable> -> operands \'$0\'' }},//Space leads to next operand
      {regex: /\//, action: { token: 'jcl-variable', log: jclDebug && '[$S0] <variable> -> --- \'$0\'' }},
      {regex: /^.*/, action: { token: 'jcl-none', log: jclDebug && '[$S0] <none> -> --- \'$0\'' }}, //When a token doesn't match, the line is blue
      {regex: /./, action: { token: 'jcl-variable', log: jclDebug && '[$S0] <variable> -> --- \'$0\'' }},//For everything else
    ],
    comments: [
      {regex: /.*/, action: { token: 'jcl-comment', next: '@popall', log: jclDebug && '[$S0] <comment> -> popall \'$0\'' }},
      {regex: / *\n| *$/, action: { token: 'jcl-default', next: '@popall', log: jclDebug && '[$S0] <default> -> --- \'$0\'' }},
    ],
    strings: [ //Strings get their own category because Monaco doesn't seem to deal with pattern matching
              //over line breaks, even with multiline flags. This way, we just put strings into their own loop.
      {regex: /.*' *$/, action: { token: 'jcl-string', next: '@popall', log: jclDebug && '[$S0] <string> -> popall \'$0\'' }},  // (') character ending line -> we are done here
      {regex: /.*' /, action: { token: 'jcl-string', next: '@comments', log: jclDebug && '[$S0] <string> -> comments \'$0\'' }}, // Space after the ending (') character is a comment
      {regex: /.*' */, action: { token: 'jcl-string', next: '@operands', log: jclDebug && '[$S0] <string> -> operands \'$0\'' }}, // Covers all characters in string until ending (') character
      {regex: /.*/, action: { token: 'jcl-string', log: jclDebug && '[$S0] <string> -> --- \'$0\'' }},
    ]
  }
};

export const JCL_LIGHT: Theme = {
  base: 'vs',
  inherit: true,
  colors: {
  },
	rules: [ // The following ruleset aims to match a JCL theme similar to one in ISPF
    { token: 'jcl-comment', foreground: '003399' }, // Light blue
    { token: 'jcl-statement', foreground: '2fa30f' }, // Green
    { token: 'jcl-operator', foreground: 'a30f0f' }, // Red
    { token: 'jcl-delimiter', foreground: 'cccc00' }, // Yellow
    { token: 'jcl-string', foreground: 'fdfdfd' }, // White
    { token: 'jcl-variable', foreground: '1a5d09' }, // Green
    { token: 'jcl-invalid', foreground: 'e60049', background: 'ff8173', fontStyle: 'bold' }, // Light red, background is supposed to be "highlight" 
    //of text but it doesn't seem to work?
    { token: 'jcl-none', foreground: '003180' }, // Blue
    { token: 'jcl-default', foreground: '22750b' }, // Green
	]
}
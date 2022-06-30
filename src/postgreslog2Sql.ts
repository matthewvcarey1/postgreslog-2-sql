#!/usr/bin/env ts-node
import * as readline from 'readline';
import { stdin as input } from 'process';

// This program turns an incoming stdin stream of postgres err logs into a stdout stream of SQL statements
// that can easily be run with a client like psql, PostBird or Postico

// You may need to add a final semicolon to use the queries in psql

// Execute statements are converted to regular statements with inline literal parameters

// More crucially it is possible prepend them with EXPLAIN ANALYZE and understand
// what aspects of the statements are not so efficient

// If you are using a library such as TypeOrm, you are insulated from the complexity of your 
// queries on Postgres. This should help allow you to unpick what is actually happening.

// Caveat: This code will not cope with a massive pipe of log text all at once, node bales out, rather 
// just pipe the logs as you run your database normally 

const rl = readline.createInterface({ input });

const statementLabel = 'LOG:  statement: ';
const executeLabel = 'LOG:  execute';
const parameterLabel = 'DETAIL:  parameters: ';
const dateRegex = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} UTC/;
let justReadExecute = false
let executeLine = ""
rl.on('line', (line:string) => {
    const isContinuationLine = !line.match(dateRegex)
    let statementIndex = line.indexOf(statementLabel)
    let execIndex = line.indexOf(executeLabel)
    let detailIndex = line.indexOf(parameterLabel)
    if(statementIndex !== -1){
        statementIndex += statementLabel.length
        const statementLine = line.substring(statementIndex)
        console.log(statementLine)
        justReadExecute = false 
    }
    if(execIndex !==-1){
        execIndex += executeLabel.length
        executeLine = line.substring(execIndex)
        execIndex = executeLine.indexOf(":") + 2
        executeLine = executeLine.substring(execIndex)      
        justReadExecute = true
    }
    else{
        if(justReadExecute === true){
            if (isContinuationLine){
                const lineIndex = line.indexOf(' ')
                executeLine += " " + line.substring(lineIndex).trim()
            }
            if( detailIndex !== -1){
                detailIndex += parameterLabel.length
                let detailLine = line.substring(detailIndex)
                const pairStrs = detailLine.split(', ')
                pairStrs.reverse()
                for (const p of pairStrs){
                    const [key,value] = p.split(' = ')
                    executeLine = executeLine.replace(key,value)
                }
                console.log(executeLine)
                justReadExecute = false 
                executeLine = ""
            }

        }
        else{
            if (isContinuationLine){
                const lineIndex = line.indexOf(' ')
                console.log(line.substring(lineIndex).trim())
            }
        }
    }
})



 
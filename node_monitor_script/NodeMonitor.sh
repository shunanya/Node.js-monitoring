#!/bin/bash

#usage: NodeMonitor.sh [command]
#allowed commands: start (default); stop; restart

cmd=0
if [[ "x$1" != "x" ]]
then
	if [[ ("$1" == "stop") ]]
	then
		cmd=1	#stop
		echo "Command for stopping..."
	else
		cmd=2	#restart
		echo "Command for restarting"
	fi
fi

# starting Node.js monitor
pid=`ps -efw | grep -i 'nmon_start.sh' | grep -v grep | awk '{print $2} ' `
#pid=`pgrep 'mmon_start.sh' `
if [[ "$pid" ]]  
then
	echo "---Node.js Monitor is running with pid = $pid"
	if [[ ($cmd -eq 0) ]] #start monitor
	then
		echo "---Node.js Monitor is already running - couldn't start a new one!!!"
		exit 1
	elif [[ ($cmd -ge 1) ]] #stop monitor
	then
		echo "---Node.js Monitor stopping... ($pid)"
		kill -SIGTERM $pid
		if [[ ($cmd -le 1) ]]
		then
			exit 0
		else
			sleep 5
		fi
	fi
elif [[ ($cmd -eq 1) ]]
then
	echo "Node.js Monitor isn't running!!!"
	exit 0
fi
echo "Node.js Monitor starting..."

# Function returns the full path to the current script.
currentscriptpath()
{
  local fullpath=`echo "$(readlink -f $0)"`
  local fullpath_length=`echo ${#fullpath}`
  local scriptname="$(basename $0)"
  local scriptname_length=`echo ${#scriptname}`
  local result_length=`echo $fullpath_length - $scriptname_length - 1 | bc`
  local result=`echo $fullpath | head -c $result_length`
  echo $result
}

PWD=` pwd `

tmp=`currentscriptpath`

cd $tmp
echo switching to ` pwd ` and start - node.js monitor

./nmon_start.sh 1> /dev/null &

echo "Node.js monitor ran with code $?" >&2

cd $PWD

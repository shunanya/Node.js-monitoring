#!/bin/bash

#usage: NodeMonitor.sh [command]
#allowed commands: status (default); start; stop; restart

cmd=-1  #status monitor (default value)
if [[ (${#*} -gt 0) ]] #number of positional params
then
    case $1 in
      status*)
		cmd=-1	#status
		echo "Command for status..."
		shift 1
		;;
      start*)
		cmd=0	#start
		echo "Command for starting..."
		shift 1
		;;
      stop*)
		cmd=1	#stop
		echo "Command for stopping..."
		shift 1
		;;
	      restart*)
	cmd=2	#restart
		echo "Command for restarting"
		shift 1
		;;
      *)
    esac
fi

# starting Node.js monitor
pid=`ps -ef | grep -i 'nmon_start.sh' | grep -v grep | awk '{print $2} ' `
#pid=`pgrep 'mmon_start.sh' `
if [[ "$pid" ]]  
then
	echo "---Node.js Monitor is running with pid = $pid"
	if [[ ($cmd -lt 0) ]] #status monitor
	then
	  exit 0
	elif [[ ($cmd -eq 0) ]] #start monitor
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
elif [[ ($cmd -eq 1) || ($cmd -lt 0) ]]
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
  local result_length="$(($fullpath_length - $scriptname_length - 1))"
  local result=`echo $fullpath | head -c $result_length`
  echo $result
}

PWD=` pwd `

tmp=`currentscriptpath`

cd $tmp
echo switching to ` pwd ` and start - node.js monitor

./nmon_start.sh "$@" 1> /dev/null &

sleep 1

pid=`ps -ef | grep -i 'nmon_start.sh' | grep -v grep | awk '{print $2} ' `
if test "$pid" ;  then
	echo " Node.js monitor ran ($pid)" >&2
else
	echo " Node.js monitor do not started" >&2
fi

cd $PWD

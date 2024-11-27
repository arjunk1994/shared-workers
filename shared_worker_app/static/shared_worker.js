// shared_worker.js
let taskList = [];
let ports = [];

console.log('Shared Worker script started');

// Handle new connections
onconnect = function(event) {
    const port = event.ports[0];
    ports.push(port);
    console.log('New port connected, total ports:', ports.length);

    // Send the current task list to the newly connected port
    port.postMessage({ action: 'updateTasks', data: taskList });

    // Listen for messages from connected tabs
    port.onmessage = function(e) {
        const { action, task, index, tasks } = e.data;

        console.log('Message received by worker:', action);

        switch (action) {
            case 'init':
                if (tasks && tasks.length > 0) {
                    console.log('Initializing task list from main thread:', tasks);
                    taskList = tasks;
                    broadcastTasks();
                }
                break;

            case 'addTask':
                console.log('Adding task in worker:', task);
                taskList.push(task);
                console.log('Current task list after addition:', taskList);
                broadcastTasks();
                break;

            case 'deleteTask':
                if (index > -1 && index < taskList.length) {
                    console.log('Deleting task at index:', index);
                    taskList.splice(index, 1);
                    console.log('Current task list after deletion:', taskList);
                    broadcastTasks();
                }
                break;
        }
    };

    // Remove the port when disconnected
    port.onmessageerror = () => {
        ports = ports.filter((p) => p !== port);
        console.log('Port disconnected, remaining ports:', ports.length);
    };
};

// Function to broadcast updated task list to all connected ports
function broadcastTasks() {
    console.log('Broadcasting tasks to all connected ports:', taskList);
    ports.forEach(function(port) {
        port.postMessage({ action: 'updateTasks', data: taskList });
    });
}


onconnect = function(event) {
    const port = event.ports[0];
    port.onmessage = function(e) {
        port.postMessage('Message from Shared Worker: ' + e.data);
    };
};

// In index.html or a script tag
const worker = new SharedWorker('shared_worker.js');
worker.port.start();

worker.port.onmessage = function(event) {
    console.log('Received from worker:', event.data);
};

worker.port.postMessage('Hello Worker');


onconnect = function(event) {
    const port = event.ports[0];
    port.onmessage = function(e) {
        console.log('Logging: ' + e.data);
    };
};

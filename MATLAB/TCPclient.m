clear; clc;
%% MATLAB TCP Client
% Configuration
HOST = 'localhost';
PORT = 1235; % Must match the MATLAB_PORT in your .env file

% Connect to Node.js server
try
    t = tcpclient(HOST, PORT, 'Timeout', 60); % 60 second timeout
    fprintf('Connected to Node.js server at %s:%d\n', HOST, PORT);
    t.UserData = 0;
catch e
    error('Failed to connect to Node.js server: %s', e.message);
end

% Send initial handshake message
write(t, JSONPRCRequest('connect', {}));

% Main loop
while isvalid(t) && ~t.UserData
    try
        % Wait for data from Node.js
        while t.NumBytesAvailable == 0 && isvalid(t) && ~t.UserData
            pause(0.1);
        end

        if ~isvalid(t) || t.UserData
            break;
        end

        % Read the message
        data = readline(t);
        disp(['RAW DATA: ', data]);
        
        try
            message = jsondecode(data);
            % Process the message
            switch message.type
                case 'evaluation_result'
                    fprintf('Evaluation result: %f\n', message.result);
                    fprintf('Timestamp: %s\n', message.timestamp);
                    t.UserData = 1; % Exit after receiving a response
                case 'error'
                    error('Node.js error: %s', message.message);
                otherwise
                    fprintf('Received unknown message type: %s\n', message.type);
            end
        catch jsonErr
            fprintf('Error parsing JSON: %s\n', jsonErr.message);
            fprintf('Raw data: %s\n', data);
        end
        
    catch e
        fprintf('Error: %s\n', e.message);
        t.UserData = 1; % Exit on error
    end
end

% Close the connection
if isvalid(t)
    delete(t); 
end
clear t;
%% Function jsonRPCRequest
function jsonStr = JSONPRCRequest(method, params)
    % Helper function to create JSON-RPC like requests
    request = struct();
    request.jsonrpc = '2.0';
    request.method = method;
    request.params = params;
    request.id = randi(10000);
    jsonStr = [jsonencode(request) newline];
end

function line = readline(t)
    % Helper function to read until newline
    line = '';
    while true
        if t.NumBytesAvailable > 0
            char = read(t, 1, 'char');
            if char == newline
                break;
            end
            line = [line char]; %#ok<AGROW>
        else
            pause(0.01);
        end
    end
end

% MATLAB TCP Client
t = tcpclient('localhost', 1235); % Match Node.js server port

% Set callback for incoming data
configureCallback(t, "terminator", @(src, event) handleNodeData(src, event));

function handleNodeData(src, ~)
    data = readline(src);
    disp(['Received from Node.js: ' data]);
    
    % Process the data (e.g., evaluate template)
    try
        result = evaluateTemplate(data); % Your evaluation function
        writeline(src, result); % Send back the result
    catch e
        writeline(src, ['ERROR: ' e.message]);
    end
end
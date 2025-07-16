clear; clc;
% MATLAB TCP Client
t = tcpclient('localhost', 1235); % Match Node.js server port

write(t,'Hello from MATLAB')
pause(3);
readline(t)
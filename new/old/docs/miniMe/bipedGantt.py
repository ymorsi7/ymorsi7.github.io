import plotly.express as px
import pandas as pd

df = pd.DataFrame([
    dict(Task="Literature Review ", Start='2021-12-24', Finish='2022-1-24', Type = 'Research'),
    dict(Task="Side-Quest: Build Arduino Biped [4] for Practice ", Start='2022-1-25', Finish='2022-2-12', Type = 'Programming',),
    dict(Task="Remote Control Capabilities for Arduino Bot ", Start='2022-2-13', Finish='2022-2-24', Type = 'Programming'),
     dict(Task="Remote Control Capabilities for Arduino Bot ", Start='2022-2-25', Finish='2022-3-1', Type = 'Testing'),
    dict(Task="Literature Review ", Start='2022-3-2', Finish='2022-3-18', Type = 'Research'),
    dict(Task="Code for Remote Control of Biped ", Start='2022-3-18', Finish='2022-3-28', Type = 'Programming'),
    dict(Task="Code for Remote Control of Biped ", Start='2022-3-18', Finish='2022-3-28', Type = 'Testing'),
    dict(Task="Camera Mounting Apparatus CAD Design + Print ", Start='2022-3-29', Finish='2022-4-15', Type = 'Design'),
    dict(Task="Camera Mounting and Testing ", Start='2022-4-16', Finish='2022-4-25', Type = 'Design'),
    dict(Task="Object Detection with OpenCV and PyTorch", Start='2022-4-26', Finish='2022-5-20', Type = 'Programming'),
    dict(Task="Literature Review ", Start='2022-5-20', Finish='2022-6-14', Type = 'Research'),
    dict(Task="Avoiding Detected Objects Code ", Start='2022-6-14', Finish='2022-6-24', Type = 'Programming'),
    dict(Task="Avoiding Detected Objects Testing ", Start='2022-6-14', Finish='2022-7-10', Type = 'Testing'),
    dict(Task="Final CAD Body Design, Ordering Materials ", Start='2022-6-20', Finish='2022-6-24', Type = 'Design'),
    dict(Task="3D Printing and Assembling Final CAD Body ", Start='2022-6-24', Finish='2022-7-10', Type = 'Design'),
    dict(Task="Applying Technology to New Body ", Start='2022-7-10', Finish='2022-7-20', Type = 'Design'),
    dict(Task="Testing of Final Body ", Start='2022-7-16', Finish='2022-7-20', Type = 'Testing'),

])

fig = px.timeline(df, x_start="Start", x_end="Finish", y="Task", color="Type")
fig.update_yaxes(autorange="reversed") # otherwise tasks are listed from the bottom up
fig.show()
fig.write_html("docs/miniMe/gantt.html")
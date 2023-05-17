import cv2
import numpy as np
from matplotlib import pyplot as plt

def showimage(myimage):
    if myimage.ndim > 2:
        myimage = myimage[:,:,::-1]
    fig, ax = plt.subplots(figsize=[10, 10])
    ax.imshow(myimage, cmap='gray', interpolation='bicubic')
    plt.xticks([]), plt.yticks([])
    plt.show()

def bgremove2(image_path):
    myimage = cv2.imread(image_path)
    
    if myimage is None:
        print("Failed to load image:", image_path)
        return None
    
    myimage_grey = cv2.cvtColor(myimage, cv2.COLOR_BGR2GRAY)
    ret, baseline = cv2.threshold(myimage_grey, 127, 255, cv2.THRESH_TRUNC)
    ret, background = cv2.threshold(baseline, 126, 255, cv2.THRESH_BINARY)
    ret, foreground = cv2.threshold(baseline, 126, 255, cv2.THRESH_BINARY_INV)
    foreground = cv2.bitwise_and(myimage, myimage, mask=foreground)
    background = cv2.cvtColor(background, cv2.COLOR_GRAY2BGR)
    finalimage = background + foreground
    return finalimage

image_path = 'test.jpg'
result = bgremove2(image_path)

if result is not None:
    showimage(result)

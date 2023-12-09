poly=[1,0,0,0,1,0]
m=6
n=int(input("Enter number of bits\n"))
print("Enter data bits")
data=[int(x) for x in input()]
if n<m:
    print("Invalid data")
    exit(0)
cdata=data.copy()
cdata.extend([0]*(m-1))
for i in range(n):
    if cdata[i]==1:
        for j in range(m-1):
            cdata[i+j]^=poly[j]
data.extend(cdata[n:])
print("Data to be transmitted ",*data,sep='')

print("Enter received data")
data=[int(x) for x in input()]
for i in range(n):
    if data[i]==1:
        for j in range(m-1):
            data[i+j]^=poly[j]
for i in data:
    if i==1:
        print("There is error in data received")
        exit(0)
print("No error in data received")






import csv
import scipy as sp
#import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
import numpy as np
from flask import Flask
from flask import jsonify,request,redirect,url_for,send_from_directory,render_template,url_for,send_file,make_response
from flaskext.mysql import MySQL
import json
import os
from werkzeug import secure_filename
import pefile
import shutil
from sklearn.linear_model import ElasticNet
from sklearn.cross_validation import KFold
from sklearn.feature_extraction.text import CountVectorizer
import sys
import nltk.stem
import docx2txt
from pptx import Presentation

#-*- coding: utf-8 -*-
mystopword = frozenset([
    "가","가운데","갈","걔","거","건","것","걸","고","곳","곳곳","그","그간","그것","그곳","그녀","그달","그당시","그대","그대신",
	"그동안","그들","그들대로","그때","그런고","그런날","그런데서","그런줄","그럴수록","그로","그무렵","그외","그이","그전","그전날",
	"그쪽","나","내게","내년초","내달","내부",
	"너","너로","너와","너희","너희대로","너희들","네","네번","네째","네탓","넷","넷째","년","년간","년도","녘","놈","누가","누구","누구누구",
	"누군가","다섯째","다음달","다음주","당분간","대다수","덧","데","되","둘","둘째","둥","뒤","뒷받침",
	"듯","등","따름","따위","딴","때","때문","마련","마지막","마찬가지","마리","만원","만큼","맏","무엇","몇","묶음","물론","못","뭣","밑",
	"밖에","백","백만원","뿐","서로","세","세째","수십","스스로","쉰","십","아홉째","어느편","어디","어디론지","어떤때",
	"여러가지","여섯째","역","열째","옆","요즘","우리","우선","움직임","월","위해서","육","으뜸",
	"이곳","이것","이날","이달초","이듬","이듬달","이때","이런저런","이런줄","이번","일곱째","쟤",
	"저것","저곳","저도","저기","저런날","저런줄","저렴","저쪽",
	"저희","적극적","전날","전년","전부","전부문","전체적","제","줄곳","지난해",
	"첫째","첫날","최근","평상시","하나","허나","한마디","한가운데","한가지","한곳","한번",
	"한쪽","한편","할",
	"a", "about", "above", "across", "after", "afterwards", "again", "against",
    "all", "almost", "alone", "along", "already", "also", "although", "always",
    "am", "among", "amongst", "amoungst", "amount", "an", "and", "another",
    "any", "anyhow", "anyone", "anything", "anyway", "anywhere", "are",
    "around", "as", "at", "back", "be", "became", "because", "become",
    "becomes", "becoming", "been", "before", "beforehand", "behind", "being",
    "below", "beside", "besides", "between", "beyond", "bill", "both",
    "bottom", "but", "by", "call", "can", "cannot", "cant", "co", "con",
    "could", "couldnt", "cry", "de", "describe", "detail", "do", "done",
    "down", "due", "during", "each", "eg", "eight", "either", "eleven", "else",
    "elsewhere", "empty", "enough", "etc", "even", "ever", "every", "everyone",
    "everything", "everywhere", "except", "few", "fifteen", "fifty", "fill",
    "find", "fire", "first", "five", "for", "former", "formerly", "forty",
    "found", "four", "from", "front", "full", "further", "get", "give", "go",
    "had", "has", "hasnt", "have", "he", "hence", "her", "here", "hereafter",
    "hereby", "herein", "hereupon", "hers", "herself", "him", "himself", "his",
    "how", "however", "hundred", "i", "ie", "if", "in", "inc", "indeed",
    "interest", "into", "is", "it", "its", "itself", "keep", "last", "latter",
    "latterly", "least", "less", "ltd", "made", "many", "may", "me",
    "meanwhile", "might", "mill", "mine", "more", "moreover", "most", "mostly",
    "move", "much", "must", "my", "myself", "name", "namely", "neither",
    "never", "nevertheless", "next", "nine", "no", "nobody", "none", "noone",
    "nor", "not", "nothing", "now", "nowhere", "of", "off", "often", "on",
    "once", "one", "only", "onto", "or", "other", "others", "otherwise", "our",
    "ours", "ourselves", "out", "over", "own", "part", "per", "perhaps",
    "please", "put", "rather", "re", "same", "see", "seem", "seemed",
    "seeming", "seems", "serious", "several", "she", "should", "show", "side",
    "since", "sincere", "six", "sixty", "so", "some", "somehow", "someone",
    "something", "sometime", "sometimes", "somewhere", "still", "such",
    "system", "take", "ten", "than", "that", "the", "their", "them",
    "themselves", "then", "thence", "there", "thereafter", "thereby",
    "therefore", "therein", "thereupon", "these", "they", "thick", "thin",
    "third", "this", "those", "though", "three", "through", "throughout",
    "thru", "thus", "to", "together", "too", "top", "toward", "towards",
    "twelve", "twenty", "two", "un", "under", "until", "up", "upon", "us",
    "very", "via", "was", "we", "well", "were", "what", "whatever", "when",
    "whence", "whenever", "where", "whereafter", "whereas", "whereby",
    "wherein", "whereupon", "wherever", "whether", "which", "while", "whither",
    "who", "whoever", "whole", "whom", "whose", "why", "will", "with",
    "within", "without", "would", "yet", "you", "your", "yours", "yourself",
    "yourselves"])

TXT_DIRECTORY= '/home/gxicxigouxa/myproject/textcompare'
UPLOAD_FOLDER= '/home/gxicxigouxa/myproject' # path convert!! (when i use different server)
ALLOWED_EXTENSIONS = 	set(['txt','pdf','png','jpg','jpeg','gif','doc','exe','docx','hwp','pptx'])

app = Flask(__name__,template_folder='templates', static_folder='/home/gxicxigouxa/myproject/templates')
app.config['UPLOAD_FOLDER']=UPLOAD_FOLDER
app.config['TXT_DIRECTORY']=TXT_DIRECTORY
app.debug=True
mysql= MySQL();

app.config['MYSQL_DATABASE_USER']='root';
app.config['MYSQL_DATABASE_PASSWORD']='root';
app.config['MYSQL_DATABASE_DB']='jhj'
mysql.init_app(app);

english_stemmer=nltk.stem.SnowballStemmer('english')
class StemmedCountVectorizer(CountVectorizer):
	def build_analyzer(self):
		analyzer = super(StemmedCountVectorizer,self).build_analyzer()
		return lambda doc: (english_stemmer.stem(w) for w in analyzer(doc))

def get_file_list(path):
	filelist=[]
	

def num_only_file(pwd):
	numOfFile=0
	filenames = os.listdir(pwd)
	for filename in filenames:
		if (os.path.isfile(pwd+'/'+filename)):
			numOfFile+=1;
			
	return numOfFile	



def dist_norm(v1,v2):
	v1_normalized = v1/sp.linalg.norm(v1.toarray())
	v2_normalized = v2/sp.linalg.norm(v2.toarray())
	delta = v1_normalized -v2_normalized
	return sp.linalg.norm(delta.toarray())


def EnLrswap(enprod,lrprod):
	i=0
	for i in range(len(enprod)):
		if(enprod[i]<=0):
			enprod[i]=lrprod[i]



def compare_dll(filename1,filename2):
	if (filename1==filename2):
		return True
	else:
		return False	

def allowed_file(filename):
	return '.' in filename and \
		filename.rsplit('.',1)[1] in ALLOWED_EXTENSIONS


@app.route('/')
def data():
	conn = mysql.connect()
	cursor= conn.cursor()

	query = "select dllname from dlltable where filename='notepad.exe';"
	
	cursor.execute(query)
	'''
	data = cursor.fetchall()
	conn.commit()

	

	
	#jsonify(data[0][0])

	dllname =str(data).split("'")
	if (str(data)=='()'):
		return "is none"
	else:
		return str(data)
	'''


	conn.commit()
	result =[]
	dllname = ''
	columns= tuple( [d[0] for d in cursor.description] )

	
	for row in cursor:
		result.append(dict(zip(columns, row)))
	
	numOfJson= len(result)
	dllname = result[0]['dllname']

	if(str(result)=='[]'):
		return "is none"
	else:
		return dllname

	#return  str(dllname[1])

'''
@app.route('/download/<filename>',methods=['GET','POST'])
def download_file(filename):
	print (filename)
	headers = {"Content-Disposition": "attachment; filename=%s" % filename}## Content-Disposition:attachment!!!! 
	with open('/home/asdiste/myproject/textcompare/test1/'+filename, 'rb' ) as f:# !!!b!!!!!!1 is important
		body = f.read()
	return make_response((body,headers))
'''

@app.route('/download/<path:filename>',methods=['GET','POST'])# put the file path after static folder(/home/asdiste/myproject)
  													#ex >  /textcompare/test1/test1.txt
def download_file(filename):
	return send_file(filename,as_attachment=True)

	
@app.route('/bookmarkDownload/<path:filename>',methods=['GET','POST'])
def bookmark_down_file(filename):


	return "ok"



@app.route('/multiuploadtest',methods=['POST'])
def  multidownloadtest():

	if request.method=='POST':
		filenames= []
		files = request.files.getlist('file[]')  # not ['file[]']!!!!!!!!!!1 ( 'file[]')!!!!!!!!!!!!!
		for file in files:
			if file and allowed_file(file.filename):
				filename = file.filename
				filenames.append(filename)
				file.save(os.path.join(app.config['TXT_DIRECTORY'],filename))

		return str(filenames)

	return "not POST method"




@app.route('/dllcompare',methods=['POST'])#post with javascript code!!!
def postfile():
	if request.method=='POST':
		
		#deal with the exe exception 


		downfile_dll_list=[]
	
		#file download to server
		file = request.files['file']  # in []  there must be name = 'file'??? search
		if file and allowed_file(file.filename):
			filename = secure_filename(file.filename)
			file.save(os.path.join(app.config['UPLOAD_FOLDER'],filename))
			

		pe = pefile.PE(UPLOAD_FOLDER+'/'+filename) #filename. exe? filenmae?

		i=0
		#parsing  downloadfile's import library
		for entry in pe.DIRECTORY_ENTRY_IMPORT:
			downfile_dll_list.append(entry.dll.decode('utf-8'))

		
		


		#db's import library
		conn = mysql.connect()
		cursor = conn.cursor()
		query = "select dllname from dlltable where filename='"+filename+"';"
		
		cursor.execute(query)
		conn.commit()
		result = []
		
		dllname = ''
		columns= tuple( [d[0] for d in cursor.description] )
		for row in cursor:
			result.append(dict(zip(columns, row)))
		


		spamdir_list = os.listdir("/home/gxicxigouxa/myproject/malware")
	
		
		


		if str(result)=='[]':# If the file do not exist in the DB
			shutil.move(UPLOAD_FOLDER+"/"+filename,UPLOAD_FOLDER+"/malware/malware/"+filename)
			#return "There is no data in DB so go to malware directory"# go to spam suspect
			return render_template('spam.html',spamdir_list=spamdir_list)
		else :# If the file is exist in DB

			dllname = result[0]['dllname']
			db_dll_list = dllname.split(',')	


			if (set(db_dll_list)==set(downfile_dll_list)):# pe import libraries are same 
				shutil.move(UPLOAD_FOLDER+"/"+filename,UPLOAD_FOLDER+"/malware/notmalware/"+filename)
				#return "IS NOT MALWARE (DownFile's dll== DB's dll)"
				return render_template('spam.html',spamdir_list=spamdir_list)

			else : # pe import libraries are differnt
				shutil.move(UPLOAD_FOLDER+"/"+filename,UPLOAD_FOLDER+"/malware/malware/"+filename)
				#return "IS MALWARE(DownFile's dll!= DB's dll)"
				return render_template('spam.html',spamdir_list=spamdir_list)



	return 'method is not POST'
#multiple upload -> request.files.getlists


@app.route('/input',methods=['POST'])#put with json
def posttest():
	if request.method =='POST':
		
		content = request.json#when you send with "Postman" you should java text -> json(applicaion/json) at body
		
		
		id = content[0]["id"]
		usedmonth = str(content[0]["usedmonth"])
		grade=str(content[0]["grade"])
		totalamount=str(content[0]["totalamount"])
		numofregist=str(content[0]["numofregist"])
		averagefee=str(content[0]["averagefee"])

		
		conn = mysql.connect()
		cursor = conn.cursor()

		
		query = "insert into jhjtable\
		(id,usedmonth,grade,totalamount,numofregist,averagefee) values \
		( '"+id+"','"+usedmonth+"','"+grade+"','"+totalamount+"','"+numofregist+"','"+averagefee+"'); "

		cursor.execute(query)
		conn.commit()
		
		

		 
		return "OK"

	return "method is not POST"

@app.route('/dbtest', methods=['GET','POST'])
def loadData():
	conn = mysql.connect()
	cursor = conn.cursor()
	cursor.execute("select * from jhjtable")

	result = [];
	columns= tuple( [d[0] for d in cursor.description] )

	
	for row in cursor:
		result.append(dict(zip(columns, row)))


	print(result);
	
	return json.dumps(result);

@app.route('/dbincomeexpect')
def dbincomeexpect():
	conn = mysql.connect()
	cursor=conn.cursor()
	cursor.execute("select * from jhjtable")
	
	result =[]
	columns= tuple( [d[0] for d in cursor.description] )

	
	for row in cursor:
		result.append(dict(zip(columns, row)))
	
	numOfJson= len(result)
	id =[]
	usedmonth=[]
	grade=[]
	totalamount=[]
	numofregist=[]
	averagefee=[]
	data= [] 
	target = []
	userid =[]
	xdata = []
	ytarget=[]

	for i in range(numOfJson):
		id.append(result[i]["id"])
		usedmonth.append(result[i]["usedmonth"])
		grade.append(result[i]["grade"])
		totalamount.append(result[i]["totalamount"])
		numofregist.append(result[i]["numofregist"])
		averagefee.append(result[i]["averagefee"])
		tmp=str(usedmonth[i])+' '+str(grade[i])+' '+str(totalamount[i])+ ' '+str(numofregist[i])
		data.append(tmp.split(' '))
		target.append(averagefee[i])
		userid.append(id[i])
		
	# ------------------------------------------------array element's string type to float!!!!!!!!!!!!!!------------------------------------------------
	for j in range(numOfJson):
		xdata.append([float(i) for i in data[j]])

		
	ytarget =[float(i) for i in target]
	
	# like map (int,list)
	# ------------------------------------------------array element's string type to float!!!!!!!!!!!!!!------------------------------------------------
	
	lr = LinearRegression()
	en = ElasticNet(alpha=0.5,precompute=False)

	
	
	y= np.transpose(np.atleast_2d(ytarget))#transpose ydata to two dimentional array
	

	lr.fit(xdata,y)
	
	lrp =lr.predict(xdata)
	
	

	kf = KFold(len(xdata),n_folds=5)

	enp = np.zeros_like(y)
	###---------------------------------important!!!!!!!!!!!!!!!!!!-----------------------------------------
	enpxdata= np.zeros_like(xdata)###important!!!!!!!!!!!!!!!!


	for i in range(len(xdata)):
		enpxdata[i]=xdata[i]
	#xdata => [[1,2,3],[4.5.6]]  enpxdata=> [[1,2,3] [4,5,6]]           no comma!!!!!	
	###---------------------------------important!!!!!!!!!!!!!!!!!!-----------------------------------------
	for train,test in kf:
		en.fit(enpxdata[train],y[train])
		enpred=np.transpose(np.atleast_2d(en.predict(enpxdata[test])))#it is very important!!!
		enp[test]=enpred
	
	EnLrswap(enp,lrp)#minus element must be swap!

	
	sum = 0
	for i in range(len(enp)):
	
		sum+=enp[i,0]
	
			
	return str(sum)
@app.route('/dbincomepersonal')
def dbincomepersonal():
	conn = mysql.connect()
	cursor=conn.cursor()
	cursor.execute("select * from jhjtable")
	
	result =[]
	columns= tuple( [d[0] for d in cursor.description] )

	
	for row in cursor:
		result.append(dict(zip(columns, row)))
	
	numOfJson= len(result)
	id =[]
	usedmonth=[]
	grade=[]
	totalamount=[]
	numofregist=[]
	averagefee=[]
	data= [] 
	target = []
	userid =[]
	xdata = []
	ytarget=[]

	for i in range(numOfJson):
		id.append(result[i]["id"])
		usedmonth.append(result[i]["usedmonth"])
		grade.append(result[i]["grade"])
		totalamount.append(result[i]["totalamount"])
		numofregist.append(result[i]["numofregist"])
		averagefee.append(result[i]["averagefee"])
		tmp=str(usedmonth[i])+' '+str(grade[i])+' '+str(totalamount[i])+ ' '+str(numofregist[i])
		data.append(tmp.split(' '))
		target.append(averagefee[i])
		userid.append(id[i])
		
	# ------------------------------------------------array element's string type to float!!!!!!!!!!!!!!------------------------------------------------
	for j in range(numOfJson):
		xdata.append([float(i) for i in data[j]])

		
	ytarget =[float(i) for i in target]
	
	# like map (int,list)
	# ------------------------------------------------array element's string type to float!!!!!!!!!!!!!!------------------------------------------------
	
	lr = LinearRegression()
	en = ElasticNet(alpha=0.5,precompute=False)

	
	
	y= np.transpose(np.atleast_2d(ytarget))#transpose ydata to two dimentional array
	

	lr.fit(xdata,y)
	
	lrp =lr.predict(xdata)
	
	

	kf = KFold(len(xdata),n_folds=5)

	enp = np.zeros_like(y)
	###---------------------------------important!!!!!!!!!!!!!!!!!!-----------------------------------------
	enpxdata= np.zeros_like(xdata)###important!!!!!!!!!!!!!!!!


	for i in range(len(xdata)):
		enpxdata[i]=xdata[i]
	#xdata => [[1,2,3],[4.5.6]]  enpxdata=> [[1,2,3] [4,5,6]]           !!!!!<no comma>!!!!!
	#if I do not this  knn expect didn't operate
	###---------------------------------important!!!!!!!!!!!!!!!!!!-----------------------------------------
	for train,test in kf:
		en.fit(enpxdata[train],y[train])
		enpred=np.transpose(np.atleast_2d(en.predict(enpxdata[test])))#it is very important!!!
		enp[test]=enpred
	
	EnLrswap(enp,lrp)#minus element must be swap!

	
	showall= ''
	enpshowall = ""
	i=0
	for i in range(len(data)):
		showall+=str(enp[i,0])+'\n'
		
		
	return str(showall)

@app.route('/total')
def test():
	user= sp.genfromtxt("user.tsv",delimiter="\t",dtype=str)# this content is string , so dtype must be str

	target= sp.genfromtxt("target.tsv",delimiter="\t")
	data= sp.genfromtxt("data.tsv",delimiter="\t")



	lr = LinearRegression()
	en = ElasticNet(alpha=0.5,precompute=False)


	xdata= data
	ytarget= target
	y= np.transpose(np.atleast_2d(ytarget))#transpose ydata to two dimentional array


	lr.fit(xdata,y)
	lrp =lr.predict(xdata)


	kf = KFold(len(xdata),n_folds=5)


	enp = np.zeros_like(y)
	for train,test in kf:
		en.fit(xdata[train],y[train])
		enpred=np.transpose(np.atleast_2d(en.predict(xdata[test])))#it is very important!!!
		enp[test]=enpred

	EnLrswap(enp,lrp)#minus element swap!


	sum = 0
	for i in range(len(enp)):
	
		sum+=enp[i,0]
		
	return str(sum)
@app.route('/showall')
def show_all():
	user= sp.genfromtxt("user.tsv",delimiter="\t",dtype=str)# this content is string , so dtype must be str

	target= sp.genfromtxt("target.tsv",delimiter="\t")
	data= sp.genfromtxt("data.tsv",delimiter="\t")



	lr = LinearRegression()
	en = ElasticNet(alpha=0.5,precompute=False)


	xdata= data
	ytarget= target
	y= np.transpose(np.atleast_2d(ytarget))#transpose ydata to two dimentional array


	lr.fit(xdata,y)
	lrp =lr.predict(xdata)


	kf = KFold(len(xdata),n_folds=5)


	enp = np.zeros_like(y)
	for train,test in kf:
		en.fit(xdata[train],y[train])
		enpred=np.transpose(np.atleast_2d(en.predict(xdata[test])))#it is very important!!!
		enp[test]=enpred

	EnLrswap(enp,lrp)#minus element swap!




	showall= ''
	enpshowall = ""
	i=0
	for i in range(len(data)):
		showall+=str(enp[i,0])+'\n'
		
		
	return str(showall)


@app.route('/textcompare',methods=['POST'])#post with javascript code!!!
def textcompare():
	if request.method =='POST':
		path_dir = TXT_DIRECTORY
		dir_list=[]
		filenames= []
		filename=''
		upload_contents=''
		
		file = request.files['file']
		
		if file and allowed_file(file.filename):
			

			filename = file.filename
			filenames.append(filename)
			file.save(os.path.join(app.config['TXT_DIRECTORY'],filename))
	

			ext = filename.split('.')
			
			if ext[1]=='txt':
				f= open(path_dir+'/'+filename,'r')
				upload_contents=f.read()
				f.close()
			elif ext[1]=='docx':
				docx_content = docx2txt.process(path_dir+'/'+filename)
				upload_contents=docx_content
			elif  ext[1]=='pptx':
				prs =Presentation(path_dir+'/'+filename)
				for slide in prs.slides:
					for shape in slide.shapes:
						if not shape.has_text_frame:
							continue
						for paragraph in shape.text_frame.paragraphs:
							for run in paragraph.runs:
								upload_contents+=run.text+ ' '
			else :
				return "no available file extension"+ '  '+str(ext[1])

		else:
			return "not allowed ext"
		
		###--------------------------parsing only directory (not file)-----------------------------------------
		for file in os.listdir(path_dir):
			if os.path.isdir(path_dir+'/'+file):
				dir_list.append(path_dir+'/'+file)

		dir_list.sort()
		###--------------------------parsing only directory (not file)-------------------------------------------
		
		
		total_score=[]
		total_content=[]
		#same index with dir_list
		


		#vectorizer = CountVectorizer(min_df=1)
		vectorizer=StemmedCountVectorizer(min_df=1,max_df=0.9, stop_words=mystopword)
		#parsing the all content in the test file not in the presentation file  pptxfile is in the another paht (ex > not /test1   /test1/presentation)
		for i in range(len(dir_list)):
			for file in os.listdir(dir_list[i]):
				
				
				if os.path.isfile(dir_list[i]+'/'+file):	# if it is file 
					ext =file.split('.')
					if ext[1]=='txt':
						f= open(dir_list[i]+'/'+file)
						total_content.append(f.read())
					if ext[1]=='docx':
						total_content.append(docx2txt.process(dir_list[i]+'/'+file))
					'''
					if ext[1]=='pptx':
						prs =Presentation(dir_list[i]+'/'+file)
						content=''
						for slide in prs.slides:
							for shape in slide.shapes:
								if not shape.has_text_frame:
									continue
								for paragraph in shape.text_frame.paragraphs:
									for run in paragraph.runs:
										content+=run.text+ ' '

						total_content.append(content)			
					'''


				else:# if it is directory
					continue			
		#parsing the all content

		                                                
		for i in range(len(total_content)):
			X_train=vectorizer.fit_transform(total_content)
			num_samples,num_features=X_train.shape
			new_post=upload_contents
			new_post_vec = vectorizer.transform([new_post])

		best_doc = None
		best_dist = sys.maxsize
		best_i=None
		for i,post in enumerate(total_content):
			#if post == new_post:
			#	continue

			post_vec = X_train.getrow(i)
			d=dist_norm(post_vec,new_post_vec)
			total_score.append(d)
			if d<best_dist:
				best_dist=d
				best_i=i

		dir_file_num=[]
		# directory's number of files!
		'''
		def num_only_file(pwd):
		numOfFile=0
		filenames = os.listdir(pwd)
		for filename in filenames:
		if (os.path.isfile(pwd)):
			numOfFile+=1;

		return numOfFile	

		'''
		
		for i in range(len(dir_list)):
			dir_file_num.append(num_only_file(dir_list[i]))#do not count the  directory , just file count(because of presentation)


		sum =0
		#find the file's closest directory location
		for i in range(len(dir_file_num)):
			sum+=dir_file_num[i] 
			if(sum>=best_i+1):
				closest_location=i
				break				
		
		'''
		def find_file_location(sum,dirFileListArr,num_directory,closest_index):
			for i in range(num_directory):
				sum+=dirFileListArr[i]
				if(sum>=closest_index+1):
					return i

		'''
		#file_location = find_file_location(sum,dir_file_num,len(dir_file_num),best_i)

		#######################

		most= dir_list[closest_location]

		
		if(filename.split('.')[1]=='pptx'):# upload file extension is pptx !!! go to presentation
			shutil.move(path_dir+'/'+filename,most+"/"+"presentation/"+filename)
		else:
			shutil.move(path_dir+'/'+filename,most+"/"+filename)
	
		#return "The closest is " +str(closest_location+1)+"'st directory! So the path is '"+str(most)+"'   totalscore " + str(total_score)+"total content : " + str(total_content)		

		

		#after this code ----------------- front section modified code
	textdir_list=[]
	textdir_list = os.listdir("/home/asdiste/myproject/textcompare")

	return render_template('txt.html',textdir_list=textdir_list)

	
	return("Method is not post")

@app.route('/bookmarkpage')
def showbookmarkpage():
	conn = mysql.connect()
	cursor=conn.cursor()
	cursor.execute("select * from bookmarktable")	
	result =[]
	columns= tuple( [d[0] for d in cursor.description] )

	
	for row in cursor:
		result.append(dict(zip(columns, row)))

	print(result)	
	bookmarknum= len(result)


	filename= []
	staticFpath=[]
	fullFpath = []

	for i in range(bookmarknum):
		filename.append(result[i]["filename"])
		staticFpath.append(result[i]["staticFpath"])
		fullFpath.append(result[i]["filepath"])


	print(filename)
	print(staticFpath)
	print(fullFpath)

	fname_path_dic=dict(zip(filename,fullFpath))
	print(fname_path_dic)
	
	return render_template('bookmark.html',fname_path_dic=fname_path_dic)
@app.route("/signup",methods= ["POST","GET"])
def signup():

	return render_template('signup.html')

@app.route("/chksignup",methods=["POST"])
def chksignup():
	if (request.method=='POST'):
		userid = request.form['userid']
		userpwd = request.form['userpwd']
		userbirth= request.form['birthday']
		print(userbirth);
		conn = mysql.connect()
		cursor = conn.cursor()
		query= "select * from userinfotable where id='"+userid+"';"#Check if there exist a user id 
		cursor.execute(query)
		conn.commit()

		result = []
		
		columns= tuple( [d[0] for d in cursor.description] )
		
		for row in cursor:
			result.append(dict(zip(columns, row)))

		if(str(result)=='[]'):
			conn = mysql.connect()
			cursor = conn.cursor()
			query = "insert into userinfotable\
			(id,pwd,birth) values \
			( '"+userid+"','"+userpwd+"','"+userbirth+"'); "
			cursor.execute(query)
			conn.commit()

			#return render_template('login.html',err_code="success")	
			return redirect('/login')
		else :
			return render_template('signup.html',err_code='already exist id')	

@app.route("/login",methods = ['POST','GET'])
def showloginpage():
	if request.method =='POST':
		userid= request.form['userid']
		userpwd= request.form['userpwd']
		

		conn = mysql.connect()
		cursor = conn.cursor()
		query= "select * from userinfotable where id='"+userid+"';"#Check if there exist a user id 
		cursor.execute(query)
		conn.commit()
		
		result = []
		
		columns= tuple( [d[0] for d in cursor.description] )
		
		for row in cursor:
			result.append(dict(zip(columns, row)))

		if(str(result)=='[]'):#when there is no user name
			return render_template('login.html',err_code="id incorrect")
		else:#when the password is wrong
			if(result[0]["pwd"]==userpwd):# pwd is correct O
				#return redirect(url_for("showspampage"))
				return redirect('/spampage')
			else:#pwd is incorrect X
				return render_template('login.html',err_code="pwd incorrect")


	return render_template('login.html',err_code="no error");
	
@app.route('/spampage')
def showspampage():
	
	spamdir_list=[]

	spamdir_list = os.listdir("/home/gxicxigouxa/myproject/malware")
	
		
	return render_template('spam.html',spamdir_list=spamdir_list)


@app.route('/txtpage')
def showtxtpage():
	textdir_list=[]
	textdir_list = os.listdir("/home/gxicxigouxa/myproject/textcompare")

	return render_template('txt.html',textdir_list=textdir_list)




@app.route('/incomepage')
def showincomepage():
	conn = mysql.connect()
	cursor=conn.cursor()
	cursor.execute("select * from jhjtable")
	
	result =[]
	columns= tuple( [d[0] for d in cursor.description] )

	
	for row in cursor:
		result.append(dict(zip(columns, row)))
	
	numOfJson= len(result)
	id =[]
	usedmonth=[]
	grade=[]
	totalamount=[]
	numofregist=[]
	averagefee=[]
	data= [] 
	target = []
	userid =[]
	xdata = []
	ytarget=[]

	for i in range(numOfJson):
		id.append(result[i]["id"])
		usedmonth.append(result[i]["usedmonth"])
		grade.append(result[i]["grade"])
		totalamount.append(result[i]["totalamount"])
		numofregist.append(result[i]["numofregist"])
		averagefee.append(result[i]["averagefee"])
		tmp=str(usedmonth[i])+' '+str(grade[i])+' '+str(totalamount[i])+ ' '+str(numofregist[i])
		data.append(tmp.split(' '))
		target.append(averagefee[i])
		userid.append(id[i])
		
	# ------------------------------------------------array element's string type to float!!!!!!!!!!!!!!------------------------------------------------
	for j in range(numOfJson):
		xdata.append([float(i) for i in data[j]])

		
	ytarget =[float(i) for i in target]
	
	# like map (int,list)
	# ------------------------------------------------array element's string type to float!!!!!!!!!!!!!!------------------------------------------------
	
	lr = LinearRegression()
	en = ElasticNet(alpha=0.5,precompute=False)

	
	
	y= np.transpose(np.atleast_2d(ytarget))#transpose ydata to two dimentional array
	

	lr.fit(xdata,y)
	
	lrp =lr.predict(xdata)
	
	

	kf = KFold(len(xdata),n_folds=5)

	enp = np.zeros_like(y)
	###---------------------------------important!!!!!!!!!!!!!!!!!!-----------------------------------------
	enpxdata= np.zeros_like(xdata)###important!!!!!!!!!!!!!!!!


	for i in range(len(xdata)):
		enpxdata[i]=xdata[i]
	#xdata => [[1,2,3],[4.5.6]]  enpxdata=> [[1,2,3] [4,5,6]]           !!!!!<no comma>!!!!!
	#if I do not this  knn expect didn't operate
	###---------------------------------important!!!!!!!!!!!!!!!!!!-----------------------------------------
	for train,test in kf:
		en.fit(enpxdata[train],y[train])
		enpred=np.transpose(np.atleast_2d(en.predict(enpxdata[test])))#it is very important!!!
		enp[test]=enpred
	
	EnLrswap(enp,lrp)#minus element must be swap!

	
	showall= ''
	enpshowall = ""
	enpshowall_list=[]
	i=0
	for i in range(len(data)):
		showall+=str(enp[i,0])+'\n'
		enpshowall_list.append(str(enp[i,0]))
		
	#return str(showall)
	#return (str(enpshowall_list))
	#return (str(averagefee))
	return render_template('income.html', user_info=result)


@app.route('/spampage/filelist',methods=['POST','GET'])
def showspampage2():
	if request.method =='POST':

		data= request.form['dir']
		print(request)
		print(data)
			
		mal_list = []
		not_mal_list=[]
		
		mal_list= os.listdir("/home/gxicxigouxa/myproject/malware/malware")
		not_mal_list=os.listdir("/home/gxicxigouxa/myproject/malware/notmalware")
		mal_file_path = "/home/gxicxigouxa/myproject/malware/malware"
		not_mal_file_path = "/home/gxicxigouxa/myproject/malware/notmalware"

		if data =="malware":
			return render_template('spamfilelist.html',file_list=mal_list,file_path=mal_file_path,flag='malware')
		else :
			return render_template('spamfilelist.html',file_list=not_mal_list,file_path=not_mal_file_path,flag='notmalware')
		#return render_template('spamfilelist.html',mal_list=not_mal_list)
		#return str(dir_list)
	return "not post"	

@app.route('/txtpage/filelist',methods=['POST','GET'])
def showtxtpage2():
	if request.method =='POST':

		data = request.form['dir']
		print(request)
		print(data)

		dir_list = []
		file_list=[]
		#dir_list = os.listdir("/home/asdiste/myproject/textcompare/"+data)
		#print(dir_list)
		for file in os.listdir("/home/gxicxigouxa/myproject/textcompare/"+data):
			if os.path.isdir("/home/gxicxigouxa/myproject/textcompare/"+data+"/"+file):# if the file is dir("presentation")
				dir_list.append(file)
			else:
				file_list.append(file)	


		print(dir_list)
		print(file_list)
		file_path = "/home/gxicxigouxa/myproject/textcompare/"+data# because I want to send filepath to presentation 
		print (file_path)

		return render_template('txtfilelist.html',dir_list=dir_list,file_list=file_list,file_path=file_path)

@app.route('/txtpage/filelist/presentation',methods=['POST','GET'])
def showpresentation():
	if request.method=='POST':
		pptFilePath = request.form['presentation']# presentation file path
		print(pptFilePath)
		file_list = []
		file_list = os.listdir(pptFilePath)

		return render_template('pptfilelist.html',file_list=file_list,file_path=pptFilePath)


	return "not post"

@app.route('/income/money')
def moneyexpect():
	conn = mysql.connect()
	cursor=conn.cursor()
	cursor.execute("select * from jhjtable")
	
	result =[]
	columns= tuple( [d[0] for d in cursor.description] )

	
	for row in cursor:
		result.append(dict(zip(columns, row)))
	
	numOfJson= len(result)
	id =[]
	usedmonth=[]
	grade=[]
	totalamount=[]
	numofregist=[]
	averagefee=[]
	data= [] 
	target = []
	userid =[]
	xdata = []
	ytarget=[]

	for i in range(numOfJson):
		id.append(result[i]["id"])
		usedmonth.append(result[i]["usedmonth"])
		grade.append(result[i]["grade"])
		totalamount.append(result[i]["totalamount"])
		numofregist.append(result[i]["numofregist"])
		averagefee.append(result[i]["averagefee"])
		tmp=str(usedmonth[i])+' '+str(grade[i])+' '+str(totalamount[i])+ ' '+str(numofregist[i])
		data.append(tmp.split(' '))
		target.append(averagefee[i])
		userid.append(id[i])
		
	# ------------------------------------------------array element's string type to float!!!!!!!!!!!!!!------------------------------------------------
	for j in range(numOfJson):
		xdata.append([float(i) for i in data[j]])

		
	ytarget =[float(i) for i in target]
	
	# like map (int,list)
	# ------------------------------------------------array element's string type to float!!!!!!!!!!!!!!------------------------------------------------
	
	lr = LinearRegression()
	en = ElasticNet(alpha=0.5,precompute=False)

	
	
	y= np.transpose(np.atleast_2d(ytarget))#transpose ydata to two dimentional array
	

	lr.fit(xdata,y)
	
	lrp =lr.predict(xdata)
	
	

	kf = KFold(len(xdata),n_folds=5)

	enp = np.zeros_like(y)
	###---------------------------------important!!!!!!!!!!!!!!!!!!-----------------------------------------
	enpxdata= np.zeros_like(xdata)###important!!!!!!!!!!!!!!!!


	for i in range(len(xdata)):
		enpxdata[i]=xdata[i]
	#xdata => [[1,2,3],[4.5.6]]  enpxdata=> [[1,2,3] [4,5,6]]           !!!!!<no comma>!!!!!
	#if I do not this  knn expect didn't operate
	###---------------------------------important!!!!!!!!!!!!!!!!!!-----------------------------------------
	for train,test in kf:
		en.fit(enpxdata[train],y[train])
		enpred=np.transpose(np.atleast_2d(en.predict(enpxdata[test])))#it is very important!!!
		enp[test]=enpred
	
	EnLrswap(enp,lrp)#minus element must be swap!

	
	showall= ''
	enpshowall = ""
	enpshowall_list=[]
	i=0
	for i in range(len(data)):
		showall+=str(enp[i,0])+'\n'
		enpshowall_list.append( int((enp[i,0]*100)+0.5)/100.0)
	
	enpincome={}
	enpincome=dict(zip(id,enpshowall_list))	
	avgincome= {}

	#ident = dict(zip (id,averagefee))
	avgincome= dict(zip(id,averagefee))

	
	return jsonify(enpincome,avgincome)


@app.route('/bookmarkdb',methods=['POST','GET'])
def bookmarkdb():
	if request.method=='POST':
		data= str(request.stream.read())
		print(data)
		tmp = data.split("'")
		print(tmp)
		parseddata= tmp[1]
		print(parseddata)
		tmp=parseddata.split(',')
		fname= tmp[0]
		staticFpath = tmp[1]
		filepath =tmp[2]
		
		print(fname)
		print(staticFpath)
		print(filepath)


		conn = mysql.connect()
		cursor = conn.cursor()

		
		query = "insert into bookmarktable\
		(filename,staticFpath,filepath) values \
		( '"+fname+"','"+staticFpath+"','"+filepath+"'); "

		cursor.execute(query)
		conn.commit()
		
		

		return "Ok"
@app.route('/deleteFile',methods=['POST','GET'])
def deletefile():
	if request.method=='POST':


		fpath=request.stream.read();
		filepath=str(fpath)
		print(filepath)
		tmp = filepath.split("'")
		filepath = tmp[1]
		print(filepath)
		os.remove(filepath);
		

		conn = mysql.connect()
		cursor = conn.cursor()
		query = "select  * from bookmarktable where filepath='"+filepath+"';"
		
		cursor.execute(query)
		conn.commit()
		result = []
		
		dllname = ''
		columns= tuple( [d[0] for d in cursor.description] )
		for row in cursor:
			result.append(dict(zip(columns, row)))
		


		
		

		print(str(result))
		
		
		if str(result)=='[]':# If the file do not exist in the DB

			print("it is not bookmark")
			#return "There is no data in DB so go to malware directory"# go to spam suspect
			return "it is not bookmark"
		else :# If the file is exist in DB
			conn = mysql.connect()
			cursor = conn.cursor()
			query = "delete from bookmarktable where filepath='"+filepath+"';"
			cursor.execute(query)
			conn.commit()
			print("It is bookmark so delete")
			return "it is bookmark so delete"



		
	return "ok"
@app.route('/deleteBookmark',methods=['POST','GET'])
def rmbookmark():
	if request.method=="POST":
		fpath = str(request.stream.read());
		tmp = fpath.split("'")
		filepath = tmp[1]
		print(filepath)
		conn = mysql.connect()
		cursor = conn.cursor()
		query= "delete from bookmarktable where filepath = '"+filepath+"';"
		cursor.execute(query)
		conn.commit()
		print("removed from the bookmark")
		return "ok"


if __name__ =='__main__':
	app.run(host='0.0.0.0',port=9999)


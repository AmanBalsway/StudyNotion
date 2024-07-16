import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux';
import { createSubSection, updateSubSection } from '../../../../../services/operations/courseDetailsAPI';
import { setCourse } from '../../../../../slices/courseSlice';
import { RxCross1 } from 'react-icons/rx';
import Upload from '../Upload'
import { IconBtn } from '../../../../common/IconBtn';

const SubSectionModal = ({
    modalData,
    setModalData,
    add = false,
    view = false,
    edit = false
}) => {

    const {
        register,
        handleSubmit,
        setValue,
        formState:{errors},
        getValues
    } = useForm();

    const dispatch = useDispatch();
    const [loading,setLoading] = useState(false);
    const {course} = useSelector((state)=>state.course);
    const {token} = useSelector((state)=>state.auth);

    useEffect(()=>{
        if(view || edit){
            setValue('lectureTitle',modalData.title);
            setValue('lectureDesc',modalData.description);
            setValue('lectureVideo',modalData.videoUrl);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    const isFormUpdated = () => {
        const currentValues = getValues();
        if(currentValues.lecture !== modalData.title ||
            currentValues.Desc !== modalData.description ||
            currentValues.lectureVideo !== modalData.videoUrl
        ) return true;  
        return false;
    }

    const handleEditSubSection = async() => {

        const currentValues = getValues();
        const formData = new FormData();

        formData.append('sectionId',modalData.sectionId);
        formData.append('subSectionId',modalData._id);

        if(currentValues.lectureTitle !== modalData.title){
            formData.append('title',currentValues.lectureTitle)
        }
        if(currentValues.lectureDesc !== modalData.description){
            formData.append('title',currentValues.lectureDesc)
        }
        if(currentValues.lectureVideo !== modalData.videoUrl){
            formData.append('title',currentValues.lectureVideo)
        }

        setLoading(true);
        // API Call
        const result = await updateSubSection(formData,token);
        if(result){
            const updatedCourseContent = course.courseContent.map((section)=>
                section._id === modalData.sectionId ? result : section);
            const updatedCourse = {...course,courseContent:updatedCourseContent}
            dispatch(setCourse(updatedCourse));
        }
        setModalData(null);
        setLoading(false);

    }

    const onSubmit = async(data) => {
        if(view){
            return;
        }
        if(edit){
            if(!isFormUpdated){
                toast.error("No changes made to the form");
            }
            else {
                // edit in store
                handleEditSubSection();
            }
            return;
        }

        // In case of add
        const formData = new FormData();
        formData.append('sectionId',modalData);
        formData.append('title',data.lectureTitle);
        formData.append('description',data.lectureDesc);
        formData.append('video',data.lectureVideo);
        setLoading(true);
        // API CALL
        const result = await createSubSection(formData,token);

        if(result){
            const updatedCourseContent = course.courseContent.map((section)=>
                section._id === modalData ? result : section);
            const updatedCourse = {...course,courseContent:updatedCourseContent}
            dispatch(setCourse(updatedCourse));
        }

        setModalData(null);
        setLoading(false);
    
    }

  return (
    <div>


        <div>
            <div>
                <p>{view && 'Viewing'} {add && 'Adding'} {edit && 'Editing'}</p>
                <button onClick={()=>(!loading ? setModalData(null):{})}>
                    <RxCross1/>
                </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Upload
                    name='lectureVideo'
                    label='Lecture Video'
                    register={register}
                    setValue={setValue}
                    errors={errors}
                    video={true}
                    viewData={view ? modalData.videoUrl : null}
                    editData={edit ? modalData.videoUrl : null}
                />
                <div>
                    <label htmlFor="lectureTitle">Lecture Title</label>
                    <input 
                        id='lectureTitle'
                        placeholder='Enter Lecture Title'
                        {...register('lectureTitle',{required:true})}
                        className='w-full' 
                    />
                    {errors.lectureTitle && (
                        <span>Lectur Title is required</span>
                    )}
                </div>
                <div>
                    <label htmlFor="lectureDesc">Lecture Description</label>
                    <textarea
                        id='lectureDesc'
                        placeholder='Enter Lecture Description'
                        {...register('lectureDesc',{required:true})}
                        className='w-full min-h-[130]'
                    />
                    {errors.lectureDesc && (
                        <span>Lecture Description is required</span>
                    )}
                </div>

                {
                    !view && (
                        <div>
                            <IconBtn
                                text={loading ? (<div>Loading...</div>)
                                    : edit ? 'Save Changes' : 'Save'
                                }
                            />
                        </div>
                    )
                }
            </form>
        </div>
    </div>
  )
}

export default SubSectionModal
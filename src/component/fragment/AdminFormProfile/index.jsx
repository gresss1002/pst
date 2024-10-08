import React, { useState, useMemo, useEffect } from "react";
import { Button, Stack } from "@chakra-ui/react";
import { DatePicker, Input, Select, SelectItem, Tooltip } from "@nextui-org/react";
import { getLocalTimeZone, parseDate, today } from "@internationalized/date";
import { PlusOutlined } from '@ant-design/icons';
import { Image, Upload } from 'antd';
import { gender } from "../../../data";
import axiosInstance from "../../../utils/axiosInstance";
import formatDate from "../../../utils/formatedDate";
import convertToISODate from "../../../utils/convertToISODate";
const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });

const AdminFormProfile = () => {

    const [userData, setUserData] = useState(null);
    const userLocal = JSON.parse(localStorage.getItem('user'));


    useEffect(() => {
        getUserData();
    }, []);

    const getUserData = async () => {
        try {
            const response = await axiosInstance.get(`/users/google/${userLocal.googleId}`);
            const userData = response.data.user;
            console.log('User data:', response.data.user);
            setUserData(userData);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };
    
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState([]);
    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewOpen(true);
    };
    const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);
    const uploadButton = (
        <button
            style={{
                border: 0,
                background: 'none',
            }}
            type="button"
            className="flex flex-col gap-2 justify-center items-center font-openSans text-[12px]"
        >
            <PlusOutlined />

            Upload <br />  Foto Anda
        </button>
    );


    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [genders, setGender] = useState('');
    const [birthDate, setBirthDate] = useState(null);
    const [telephone, setTelephone] = useState('');
    const [image, setImage] = useState(null); // State untuk menyimpan file gambar
    const [imageStatus, setImageStatus] = useState('nonActive'); // Status upload gambar


    useEffect(() => {
        if (userData !== null) {
            setName(userData?.name || '');
            setEmail(userData?.email || '');
            setGender(userData?.gender || '');
            setBirthDate(userData?.birthDate ? parseDate(convertToISODate(userData.birthDate)) : null);
            setTelephone(userData?.telephone || '');
        }
    }, [userData]);

    // Status Validasi
    const nameStatus = useMemo(() => {
        if (name === "") return "nonActive";
        if (/^[A-Za-z\s]+$/.test(name)) return "success";
        return "danger";
    }, [name]);

    const emailStatus = useMemo(() => {
        if (email === "") return "nonActive";
        if (/^[A-Za-z0-9._%+-]+@(gmail\.com|bps\.go\.id)$/i.test(email)) return "success";
        return "danger";
    }, [email]);

    const genderStatus = useMemo(() => {
        if (genders === "") return "nonActive";
        if (genders !== "") return "success";
        return "danger";
    }, [genders]);

    const birthDateStatus = useMemo(() => {
        if (birthDate === null) return "nonActive";
        if (birthDate !== null) return "success";
        return "danger";
    }, [birthDate]);

    const telephoneStatus = useMemo(() => {
        if (telephone === "") return "nonActive";
        if (/^08\d{10}$/.test(telephone)) return "success";
        return "danger";
    }, [telephone]);

    const handlePerbaruiButtonClick = () => {
        const updatedUserData = {
            name: name,
            email: email,
            gender: genders,
            birthDate: formatDate(birthDate),
            telephone: telephone
        };

        console.log("Updated User Data:", updatedUserData);

        updateUserData(updatedUserData);
    }

    const updateUserData = async (updatedUserData) => {
        try {
            const response = await axiosInstance.patch(`/users/${userData._id}`, updatedUserData);
            console.log("User data updated successfully:", response.data);
        } catch (error) {
            console.error("Error updating user data:", error);
        }
    }

    const isButtonDisabled = useMemo(() => {
        return (
            nameStatus === "nonActive" || nameStatus === "danger" ||
            emailStatus === "nonActive" || emailStatus === "danger" ||
            genderStatus === "nonActive" || genderStatus === "danger" ||
            birthDateStatus === "nonActive" || birthDateStatus === "danger" ||
            telephoneStatus === "nonActive" || telephoneStatus === "danger"
        );
    }, [nameStatus, emailStatus, genderStatus, birthDateStatus, telephoneStatus]);

    return (
        <div className="flex min-h-screen my-4 mx-2">
            <div className="w-full">
                <Stack>
                    <div className="flex flex-col gap-3 justify-center items-center">
                        <Upload
                            action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                            listType="picture-circle"
                            onPreview={handlePreview}
                            onChange={handleChange}
                        >
                            {fileList.length >= 1 ? null : uploadButton}
                        </Upload>
                        {previewImage && (
                            <Image
                                wrapperStyle={{
                                    display: 'none',
                                }}
                                preview={{
                                    visible: previewOpen,
                                    onVisibleChange: (visible) => setPreviewOpen(visible),
                                    afterOpenChange: (visible) => !visible && setPreviewImage(''),
                                }}
                                src={previewImage}
                            />
                        )}

                        <Input
                            value={name}
                            type="text"
                            label="Nama"
                            variant="bordered"
                            isInvalid={nameStatus === "danger"}
                            color={nameStatus}
                            errorMessage={nameStatus === "danger" ? "Nama hanya boleh mengandung huruf" : ""}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full"
                            isRequired
                            isReadOnly
                        />

                        <Input
                            value={email}
                            type="email"
                            label="Email"
                            variant="bordered"
                            isInvalid={emailStatus === "danger"}
                            color={emailStatus}
                            errorMessage={emailStatus === "danger" ? "Masukkan alamat email yang valid yaitu namaEmail@gmail.com atau namaEmail@bps.go.id" : ""}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full"
                            isRequired
                            isReadOnly
                        />

                        <Select
                            label="Jenis Kelamin"
                            className="w-full"
                            variant="bordered"
                            isInvalid={genderStatus === "danger"}
                            color={genderStatus}
                            errorMessage={genderStatus === "danger" ? "Pilih Jenis Kelamin" : ""}
                            onChange={(e) => setGender(e.target.value)}
                            isRequired
                            selectedKeys={[genders]}
                        >
                            {gender.map((jk) => (
                                <SelectItem key={jk.value} value={jk.value}>
                                    {jk.label}
                                </SelectItem>
                            ))}
                        </Select>

                        <DatePicker
                            label="Tanggal Lahir"
                            variant="bordered"
                            maxValue={today(getLocalTimeZone()).subtract({ years: 10 })}
                            className="w-full"
                            isInvalid={birthDateStatus === "danger"}
                            color={birthDateStatus}
                            errorMessage={birthDateStatus === "danger" ? "Masukkan tanggal lahir yang valid" : ""}
                            value={birthDate}
                            onChange={setBirthDate}
                            showMonthAndYearPickers
                        />

                        {/* <Select
                            label="Asal Provinsi"
                            className="w-full"
                            variant="bordered"
                            isInvalid={provinsiStatus === "danger"}
                            color={provinsiStatus}
                            errorMessage={provinsiStatus === "danger" ? "Pilih provinsi" : ""}
                            onChange={(e) => handleProvinsiChange(e.target.value)}
                            isRequired
                        >
                            {prov.map((item) => (
                                <SelectItem key={item.provinsi} value={item.provinsi}>
                                    {item.provinsi}
                                </SelectItem>
                            ))}
                        </Select> */}

                        {/* <Select
                            label="Asal Kabupaten/Kota"
                            className="w-full"
                            variant="bordered"
                            isInvalid={kabupatenStatus === "danger"}
                            color={kabupatenStatus}
                            errorMessage={
                                kabupatenStatus === "danger"
                                    ? "Pilih asal provinsi terlebih dahulu"
                                    : ""
                            }
                            onClick={handleKabupatenClick}
                            onChange={(e) => setKabupaten(e.target.value)}
                            isRequired
                        >
                            {kabupatenFiltered.map((k) => (
                                <SelectItem key={k.value} value={k.value}>
                                    {k.label}
                                </SelectItem>
                            ))}
                        </Select> */}
                        {/* 
                        <Select
                            label="Jabatan"
                            className="w-full"
                            variant="bordered"
                            isInvalid={jabatanStatus === "danger"}
                            color={jabatanStatus}
                            errorMessage={jabatanStatus === "danger" ? "Pilih pekerjaan" : ""}
                            onChange={(e) => setJabatan(e.target.value)}
                            isRequired
                        >
                            {posisiton.map((a) => (
                                <SelectItem key={a.value} value={a.value}>
                                    {a.label}
                                </SelectItem>
                            ))}
                        </Select>

                        <Select
                            label="Bidang"
                            className="w-full"
                            variant="bordered"
                            selectionMode="multiple"
                            isInvalid={bidangStatus === "danger"}
                            color={bidangStatus}
                            errorMessage={bidangStatus === "danger" ? "Pilih pendidikan" : ""}
                            onChange={(e) => setBidang(e.target.value)}
                            isRequired
                        >
                            {field.map((p) => (
                                <SelectItem key={p.value} value={p.value}>
                                    {p.label}
                                </SelectItem>
                            ))}
                        </Select>

                        <Select
                            label="Ketersediaan Hari"
                            className="w-full"
                            variant="bordered"
                            selectionMode="multiple"
                            isInvalid={hariStatus === "danger"}
                            color={hariStatus}
                            errorMessage={hariStatus === "danger" ? "Pilih pendidikan" : ""}
                            onChange={(e) => setHari(e.target.value)}
                            isRequired
                        >
                            {available.map((p) => (
                                <SelectItem key={p.value} value={p.value}>
                                    {p.label}
                                </SelectItem>
                            ))}
                        </Select> */}

                        <Input
                            value={telephone}
                            type="tel"
                            label="Nomor Telepon"
                            variant="bordered"
                            isInvalid={telephoneStatus === "danger"}
                            color={telephoneStatus}
                            errorMessage={telephoneStatus === "danger" ? "Nomor Telepon harus berupa 08xxxxxxxxxx" : ""}
                            onChange={(e) => setTelephone(e.target.value)}
                            className="w-full"
                            isRequired
                        />


                    </div>
                </Stack>
                <div className="flex flex-col justify-center items-center h-[60px] text-[14px] gap-1 mt-2">
                    <Button variant='ghost' colorScheme='bluePrimary' className="text-nonActive border-2 hover:bg-bluePrimary hover:text-white gap-2" style={{ borderRadius: "20px", width: '110px' }} isDisabled={isButtonDisabled} onClick={handlePerbaruiButtonClick}>
                        Perbaharui
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AdminFormProfile;

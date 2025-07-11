
interface LabelledInputProps {
    label : string;
    placeholder : string;
    onChangeFunc : (value : string) => void;
}


export default function LabelledInput({label, placeholder, onChangeFunc} : LabelledInputProps)
{
    return (
        <div>
            <div className="mb-2 text-sm font-semibold text-gray-900">
                {label}
            </div>
            <input onChange={(e) => {
                onChangeFunc(e.target.value);
            }} placeholder={placeholder} id="first_name" type="number" className="border border-gray-300 h-9 rounded-lg w-full bg-gray-50 p-2.5 text-gray-900 text-sm focus:ring-blue-500"></input>
        </div>
    )
}
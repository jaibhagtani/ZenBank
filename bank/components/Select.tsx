"use client"
interface SelectProps {
    options : {
        key : string,
        value: string
    }[],
    onSelect : (value: string) => void 
}



export default function Select({options, onSelect} : SelectProps)
{
    return (

        <select onChange={(e) => {
            onSelect(e.target.value);
        }} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
            {options.map(option => 
                <option value={option.key}>{option.value}</option>
            )}
        </select>

    )
}
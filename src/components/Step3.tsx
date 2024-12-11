import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function Step3({ formData, handleFrequencyChange, frequencies }) {
  return (
    <Select value={formData.frequency} onValueChange={handleFrequencyChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select frequency" />
      </SelectTrigger>
      <SelectContent>
        {frequencies.map((freq) => (
          <SelectItem key={freq.value} value={freq.value}>
            {freq.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default Step3;

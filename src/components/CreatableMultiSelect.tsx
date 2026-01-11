"use client"

import CreatableSelect from "react-select/creatable"
import type { MultiValue, ActionMeta } from "react-select"

export type Option = { label: string; value: string }

export function CreatableMultiSelect({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[]
  value: { label: string; value: string }[]
  onChange: (values: Option[]) => void
}) {
  const handleChange = (
    newValue: MultiValue<Option>,
    _meta: ActionMeta<Option>
  ) => {
    onChange([...newValue])
  }

  return (
    <CreatableSelect
      isMulti
      options={options}
      value={value}
      onChange={handleChange}
    />
  )
}

export function CreatableMultiSelectSkeleton() {
  return (
    <CreatableSelect isMulti options={[]} isDisabled placeholder="Loading..." />
  )
}

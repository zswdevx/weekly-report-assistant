import React, { useEffect, useRef, useState } from 'react'
import { PlusOutlined, UserOutlined } from '@ant-design/icons'
import type { InputRef } from 'antd'
import { Flex, Input, Tag, theme, Tooltip } from 'antd'
import { useUpdateEffect } from 'ahooks'

const tagInputStyle: React.CSSProperties = {
  width: 64,
  height: 22,
  marginInlineEnd: 8,
  verticalAlign: 'top',
}

type Props = {
  value?: string[]
  onAdd?: (name: string) => void
  onDel?: (name: string) => void
}
const AuthorTag = ({ value, onAdd, onDel }: Props) => {
  const { token } = theme.useToken()
  const [tags, setTags] = useState(value || [])
  const [inputVisible, setInputVisible] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<InputRef>(null)

  useUpdateEffect(() => {
    if (value) {
      setTags(value)
    }
  }, [value])

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus()
    }
  }, [inputVisible])

  const handleClose = (name: string) => {
    onDel?.(name)
  }

  const showInput = () => {
    setInputVisible(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputConfirm = () => {
    if (inputValue) {
      onAdd?.(inputValue)
    }
    setInputVisible(false)
    setInputValue('')
  }

  const tagPlusStyle: React.CSSProperties = {
    height: 22,
    background: token.colorBgContainer,
    borderStyle: 'dashed',
  }

  return (
    <Flex gap="4px 0" wrap>
      {tags.map<React.ReactNode>((tag) => {
        const isLongTag = tag.length > 20
        const tagElem = (
          <Tag
            key={tag}
            closable
            icon={<UserOutlined />}
            color={token.colorPrimary}
            style={{ userSelect: 'none' }}
            onClose={() => handleClose(tag!)}
          >
            <span>{isLongTag ? `${tag.slice(0, 20)}...` : tag}</span>
          </Tag>
        )
        return isLongTag ? (
          <Tooltip title={tag} key={tag}>
            {tagElem}
          </Tooltip>
        ) : (
          tagElem
        )
      })}
      {inputVisible ? (
        <Input
          ref={inputRef}
          type="text"
          size="small"
          style={tagInputStyle}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
        />
      ) : (
        <Tag style={tagPlusStyle} icon={<PlusOutlined />} onClick={showInput}>
          New Author
        </Tag>
      )}
    </Flex>
  )
}

export default AuthorTag

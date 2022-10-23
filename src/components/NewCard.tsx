import { Modal, Form, Row, Button, Toast } from "@douyinfe/semi-ui";
import { useState, useEffect } from "react";
import { CardInCreate, CardStatus, User } from "../types";
import { createCard, fetchUsers } from "../tauri";

type NewCardProps = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    status: CardStatus;
};

export const NewCard = ({ visible, setVisible, status }: NewCardProps) => {
    const handleSubmit = async (values: Record<string, any>) => {
        let receipt_date = values.receipt_date.toISOString().slice(0, 10);
        let due_date = values.due_date.toISOString().slice(0, 10);
        const card: CardInCreate = {
            file_id: values.file_id,
            file_uri: values.file[0].name,
            receipt_date: receipt_date,
            due_date: due_date,
            assignee: values.assignee,
            status: status,
        };
        await createCard(card);
        setVisible(false);
        Toast.success("创建卡片成功!");
    };

    const [users, setUsers] = useState<User[]>([]);

    const refushUsers = async () => {
        const users = await fetchUsers();
        setUsers(users);
    };

    useEffect(() => {
        refushUsers();
    });

    const syncValidate = (values: Record<string, any>) => {
        const errors: { [key: string]: string } = {};
        if (!values.file_id) {
            errors["file_id"] = "文件编号不能为空";
        }
        if (!values.file) {
            errors["file"] = "文件不能为空";
        }
        if (!values.receipt_date) {
            errors["receipt_date"] = "收文日期不能为空";
        }
        if (!values.due_date) {
            errors["due_date"] = "办结日期不能为空";
        }
        if (!values.assignee) {
            errors["assignee"] = "办理人不能为空";
        }
        return Object.keys(errors).length !== 0 ? errors : "";
    };

    return (
        <Modal
            title="创建卡片"
            visible={visible}
            closeOnEsc={true}
            onOk={() => setVisible(false)}
            onCancel={() => setVisible(false)}
            footer={null}
        >
            <Form
                labelPosition="left"
                labelAlign="left"
                labelWidth={100}
                onSubmit={handleSubmit}
                validateFields={syncValidate}
            >
                <Row>
                    <Form.Upload
                        field="file"
                        label="文件"
                        action=""
                        uploadTrigger="custom"
                    >
                        <Button theme="light">点击上传</Button>
                    </Form.Upload>
                </Row>
                <Row>
                    <Form.Input field="file_id" label="文号" />
                </Row>
                <Row>
                    <Form.DatePicker
                        field="receipt_date"
                        label="收文日期"
                        initValue={new Date()}
                        placeholder="请选择收文日期"
                        density="compact"
                        className="w-full"
                    />
                </Row>
                <Row>
                    <Form.DatePicker
                        field="due_date"
                        label="完成时限"
                        initValue={new Date()}
                        placeholder="请选择截止日期"
                        className="w-full"
                    />
                </Row>
                <Row>
                    <Form.Select
                        field="assignee"
                        label="落实人"
                        className="w-full"
                    >
                        {users.map((user) => (
                            <Form.Select.Option
                                value={user.username}
                                key={user.id}
                            >
                                {user.username}
                            </Form.Select.Option>
                        ))}
                    </Form.Select>
                </Row>
                <Row className="flex justify-end mt-2 mb-8">
                    <Button htmlType="submit">提交</Button>
                </Row>
            </Form>
        </Modal>
    );
};

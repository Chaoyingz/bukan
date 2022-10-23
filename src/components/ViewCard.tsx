import { Modal, Form, Row, Button, Popconfirm, Toast } from "@douyinfe/semi-ui";
import { FormApi } from "@douyinfe/semi-ui/lib/es/form/interface";
import { useState, useEffect, useRef } from "react";
import { fetchCard, fetchUsers, deleteCard, updateCard } from "../tauri";
import { CardInDB, CardInUptate, User } from "../types";

type ViewCardProps = {
    cardId: number;
    visible: boolean;
    setVisible: (visible: boolean) => void;
    setCardId: (cardId: null | number) => void;
};

export const ViewCard = ({
    cardId,
    visible,
    setVisible,
    setCardId,
}: ViewCardProps) => {
    const handleCancel = () => {
        setVisible(false);
        setCardId(null);
    };
    const [isInit, setIsInit] = useState(true);
    const formApiRef = useRef<FormApi>();
    const saveFormApi = (formApi: FormApi) => {
        formApiRef.current = formApi;
    };

    const [card, setCard] = useState<CardInDB | null>(null);
    useEffect(() => {
        if (cardId) {
            fetchCard(cardId).then((card) => {
                setCard(card);
            });
        }
    }, [cardId]);
    useEffect(() => {
        if (card && formApiRef.current && isInit) {
            formApiRef.current.setValues(card);
            setIsInit(false);
        }
    });

    const [users, setUsers] = useState<User[]>([]);
    const refushUsers = async () => {
        const users = await fetchUsers();
        setUsers(users);
    };
    useEffect(() => {
        refushUsers();
    });
    const handleDeleteCard = async () => {
        await deleteCard(cardId);
        handleCancel();
        Toast.success("删除卡片成功！");
    };

    const handleUpdate = async (values: Record<string, any>) => {
        let receipt_date, due_date, received_file_uri;
        if (typeof values.receipt_date === "string") {
            receipt_date = values.receipt_date;
        } else {
            receipt_date = values.receipt_date.toISOString().slice(0, 10);
        }
        if (typeof values.due_date === "string") {
            due_date = values.due_date;
        } else {
            due_date = values.due_date.toISOString().slice(0, 10);
        }
        if (values.received_file) {
            received_file_uri = values.received_file[0].name;
        } else {
            received_file_uri = values.received_file_uri;
        }
        const card_in_update: CardInUptate = {
            file_id: values.file_id,
            file_uri: values.file_uri,
            receipt_date: receipt_date,
            due_date: due_date,
            assignee: values.assignee,
            status: values.status,
            received_file_uri: received_file_uri,
        };
        console.log(card_in_update);
        await updateCard(cardId, card_in_update);
        handleCancel();
        Toast.success("更新卡片成功!");
    };
    const syncValidate = (values: Record<string, any>) => {
        const errors: { [key: string]: string } = {};
        if (!values.file_id) {
            errors["file_id"] = "文件编号不能为空";
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
        console.log(errors);
        return Object.keys(errors).length !== 0 ? errors : "";
    };
    return (
        <Modal
            title="编辑卡片"
            visible={visible}
            closeOnEsc={true}
            onOk={() => setVisible(false)}
            onCancel={handleCancel}
            footer={null}
        >
            <Form
                labelPosition="left"
                labelAlign="left"
                labelWidth={100}
                onSubmit={handleUpdate}
                validateFields={syncValidate}
                getFormApi={(formApi) => saveFormApi(formApi)}
            >
                <Row>
                    <Form.Input
                        field="file_uri"
                        label="文件"
                        disabled
                    ></Form.Input>
                </Row>
                <Row>
                    <Form.Input
                        field="file_id"
                        label="文号"
                        initValue={card?.file_id}
                        disabled
                    />
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
                        initValue={card?.assignee}
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
                {card?.received_file_uri && (
                    <Row>
                        <Form.Input
                            field="received_file_uri"
                            label="已收落实文"
                            disabled
                        ></Form.Input>
                    </Row>
                )}
                <Row>
                    <Form.Upload
                        field="received_file"
                        label={
                            !card?.received_file_uri
                                ? "添加落实文"
                                : "补充落实文"
                        }
                        action=""
                        uploadTrigger="custom"
                    >
                        <Button theme="light">点击上传</Button>
                    </Form.Upload>
                </Row>
                <Row>
                    <Form.Select
                        field="status"
                        label="状态"
                        className="w-full"
                        initValue={card?.status}
                    >
                        <Form.Select.Option value="TODO">
                            待办
                        </Form.Select.Option>
                        <Form.Select.Option value="DOING">
                            进行中
                        </Form.Select.Option>
                        <Form.Select.Option value="DONE">
                            已完成
                        </Form.Select.Option>
                    </Form.Select>
                </Row>
                <Row className="flex justify-end mt-2 mb-8">
                    <Button
                        className="mr-2"
                        type="danger"
                        onClick={handleDeleteCard}
                    >
                        删除
                    </Button>
                    <Button htmlType="submit">保存</Button>
                </Row>
            </Form>
        </Modal>
    );
};

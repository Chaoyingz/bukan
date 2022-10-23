import {
    Modal,
    Form,
    Row,
    Button,
    Avatar,
    AvatarGroup,
    Popover,
    Toast,
} from "@douyinfe/semi-ui";
import { useState, useEffect } from "react";
import { createUser, fetchUsers, deleteUser } from "../tauri";
import { User } from "../types";

export const UserMenu = () => {
    const [visible, setVisible] = useState(false);
    const [userPopoverVisible, setUserPopoverVisible] = useState<{
        [key: number]: boolean;
    }>({});
    const [users, setUsers] = useState<User[]>([]);

    const refushUsersPopoverVisible = () => {
        let newVisible: { [key: number]: boolean } = {};
        users.forEach((user) => {
            newVisible[user.id] = false;
        });
        setUserPopoverVisible(newVisible);
    };

    const refushUsers = async () => {
        const users = await fetchUsers();
        setUsers(users);
    };

    const handleUserPopoverVisibleChange = (id: number, visible: boolean) => {
        setUserPopoverVisible({ ...userPopoverVisible, [id]: visible });
    };

    useEffect(() => {
        refushUsers();
        refushUsersPopoverVisible();
    }, []);
    const handleSubmit = async (values: Record<string, any>) => {
        await createUser(values.username);
        Toast.success("添加用户成功!");
        refushUsers();
        refushUsersPopoverVisible();
        setVisible(false);
    };
    const handleDelete = async (id: number) => {
        deleteUser(id);
        Toast.success("删除用户成功!");
        refushUsers();
    };
    const syncValidate = (values: Record<string, any>) => {
        const errors: { [key: string]: string } = {};
        if (!values.username) {
            errors["username"] = "用户名不能为空";
        }
        return Object.keys(errors).length !== 0 ? errors : "";
    };
    return (
        <div className="flex items-center">
            <div>
                <AvatarGroup size="small">
                    {users.map((user) => (
                        <Popover
                            visible={userPopoverVisible[user.id]}
                            className="py-3 pl-3 pr-4"
                            content={
                                <div className="flex">
                                    <div className="mr-3">
                                        <Avatar
                                            key={user.id}
                                            color={user.color}
                                            size="small"
                                        >
                                            {user.username}
                                        </Avatar>
                                    </div>
                                    <div>
                                        <div className="mb-1 flex items-center">
                                            <span className="text-base font-semibold">
                                                {user.username}
                                            </span>
                                            <button
                                                className="bg-transparent ml-1"
                                                title="删除用户"
                                                onClick={() =>
                                                    handleDelete(user.id)
                                                }
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className="w-5 h-5"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                        <div>ID: {user.id}</div>
                                    </div>
                                </div>
                            }
                            trigger="custom"
                            key={user.id}
                            clickToHide={true}
                            showArrow={true}
                            onClickOutSide={() =>
                                handleUserPopoverVisibleChange(user.id, false)
                            }
                        >
                            <Avatar
                                key={user.id}
                                color={user.color}
                                size="small"
                                onClick={() =>
                                    handleUserPopoverVisibleChange(
                                        user.id,
                                        true
                                    )
                                }
                            >
                                {user.username}
                            </Avatar>
                        </Popover>
                    ))}
                </AvatarGroup>
            </div>
            <button
                title="添加人员"
                className="bg-transparent ml-1"
                onClick={() => setVisible(true)}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.2}
                    stroke="currentColor"
                    className="w-7 h-7"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            </button>
            <Modal
                title="添加人员"
                visible={visible}
                closeOnEsc={true}
                onOk={() => setVisible(false)}
                onCancel={() => setVisible(false)}
                footer={null}
            >
                <Form
                    labelPosition="left"
                    labelAlign="left"
                    onSubmit={handleSubmit}
                    validateFields={syncValidate}
                >
                    <Row>
                        <Form.Input field="username" label="人员姓名" />
                    </Row>
                    <Row className="flex justify-end mt-2 mb-8">
                        <Button htmlType="submit">提交</Button>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
};
